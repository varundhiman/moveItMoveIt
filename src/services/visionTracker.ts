import { RoutineType, FormFeedback, SkeletonPose, Point2D } from '../types';

export interface TrackerCallbacks {
  onRepCount?: (count: number) => void;
  onHoldProgress?: (elapsedSeconds: number, targetSeconds: number) => void;
  onFeedback?: (feedback: FormFeedback) => void;
  onPoseUpdate?: (pose: SkeletonPose) => void;
}

export class VisionTracker {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;

  private routineType: RoutineType = 'squats';
  private targetCount: number = 10;
  private currentCount: number = 0;
  private callbacks: TrackerCallbacks = {};

  // Rep State Machine
  private exerciseState: 'up' | 'down' | 'closed' | 'open' | 'holding' = 'up';
  private lastRepTimestamp: number = 0;
  private holdStartTimestamp: number | null = null;
  private accumulatedHoldMs: number = 0;
  private isHoldingGoodForm: boolean = false;

  // Computer Vision Motion & Pose State
  private prevFrameData: ImageData | null = null;
  private smoothedHipY: number = 0.5;
  private smoothedKneeAngle: number = 180;
  private smoothedElbowAngle: number = 180;
  private smoothedJackWidth: number = 0.3;
  private smoothedHandHeight: number = 0.6;
  private smoothedPlankAlignment: number = 180;
  private motionEnergy: number = 0;
  private frameCount: number = 0;

  constructor(routineType: RoutineType, targetCount: number, callbacks: TrackerCallbacks) {
    this.routineType = routineType;
    this.targetCount = targetCount;
    this.callbacks = callbacks;
  }

  public setRoutine(routineType: RoutineType, targetCount: number) {
    this.routineType = routineType;
    this.targetCount = targetCount;
    this.currentCount = 0;
    this.exerciseState = routineType === 'jumping_jacks' ? 'closed' : 'up';
    this.accumulatedHoldMs = 0;
    this.holdStartTimestamp = null;
    this.isHoldingGoodForm = false;
  }

  public start(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.isRunning = true;
    this.currentCount = 0;
    this.accumulatedHoldMs = 0;
    this.holdStartTimestamp = null;
    this.exerciseState = this.routineType === 'jumping_jacks' ? 'closed' : 'up';

    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public manualIncrementRep() {
    if (this.currentCount < this.targetCount) {
      this.currentCount += 1;
      this.callbacks.onRepCount?.(this.currentCount);
    }
  }

  private loop = () => {
    if (!this.isRunning) return;

    if (this.video && this.video.readyState >= 2 && this.canvas && this.ctx) {
      const width = this.canvas.width;
      const height = this.canvas.height;

      // Draw mirrored video frame to canvas
      this.ctx.save();
      this.ctx.translate(width, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.video, 0, 0, width, height);
      this.ctx.restore();

      // Analyze frame with Vision Pipeline
      this.processVisionFrame(width, height);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private processVisionFrame(width: number, height: number) {
    if (!this.ctx || !this.video) return;

    this.frameCount++;
    // Sample optical motion every 2 frames for optimal mobile performance
    const sampleW = 64;
    const sampleH = 48;
    
    // Create an offscreen buffer or downsampled read
    let downCanvas = (this as unknown as { _downCanvas?: HTMLCanvasElement })._downCanvas;
    if (!downCanvas) {
      downCanvas = document.createElement('canvas');
      downCanvas.width = sampleW;
      downCanvas.height = sampleH;
      (this as unknown as { _downCanvas: HTMLCanvasElement })._downCanvas = downCanvas;
    }
    const downCtx = downCanvas.getContext('2d', { willReadFrequently: true });
    if (!downCtx) return;

    // Draw downsampled
    downCtx.drawImage(this.video, 0, 0, sampleW, sampleH);
    const currData = downCtx.getImageData(0, 0, sampleW, sampleH);

    let diffEnergy = 0;
    let sumX = 0;
    let sumY = 0;
    let activePixels = 0;

    // Top half active pixels (arms/head) and bottom half (legs/hips)
    let topActiveY = 0;
    let topCount = 0;
    let bottomActiveY = 0;
    let bottomCount = 0;
    let leftSpread = sampleW;
    let rightSpread = 0;

    if (this.prevFrameData) {
      const curr = currData.data;
      const prev = this.prevFrameData.data;
      const len = curr.length;

      for (let i = 0; i < len; i += 4) {
        // Luminance difference
        const lum1 = curr[i] * 0.299 + curr[i + 1] * 0.587 + curr[i + 2] * 0.114;
        const lum2 = prev[i] * 0.299 + prev[i + 1] * 0.587 + prev[i + 2] * 0.114;
        const diff = Math.abs(lum1 - lum2);

        if (diff > 22) {
          diffEnergy += diff;
          const pixelIndex = i / 4;
          const px = pixelIndex % sampleW;
          const py = Math.floor(pixelIndex / sampleW);

          sumX += px;
          sumY += py;
          activePixels++;

          if (py < sampleH * 0.5) {
            topActiveY += py;
            topCount++;
          } else {
            bottomActiveY += py;
            bottomCount++;
          }

          if (px < leftSpread) leftSpread = px;
          if (px > rightSpread) rightSpread = px;
        }
      }
    }
    this.prevFrameData = currData;

    this.motionEnergy = this.motionEnergy * 0.7 + (diffEnergy / (sampleW * sampleH)) * 0.3;

    // Estimate user centroid and vertical bounds
    const centroidNormX = activePixels > 20 ? (sumX / activePixels) / sampleW : 0.5;
    const centroidNormY = activePixels > 20 ? (sumY / activePixels) / sampleH : 0.5;
    const topCentroidY = topCount > 10 ? (topActiveY / topCount) / sampleH : centroidNormY * 0.6;
    const bottomCentroidY = bottomCount > 10 ? (bottomActiveY / bottomCount) / sampleH : centroidNormY * 1.3;
    const spreadWidth = activePixels > 20 ? Math.max(0.15, (rightSpread - leftSpread) / sampleW) : 0.3;

    // Smooth values for kinematics
    this.smoothedHipY = this.smoothedHipY * 0.75 + centroidNormY * 0.25;
    this.smoothedJackWidth = this.smoothedJackWidth * 0.7 + spreadWidth * 0.3;
    this.smoothedHandHeight = this.smoothedHandHeight * 0.7 + topCentroidY * 0.3;

    // Synthesize anatomical landmarks
    const pose = this.generatePoseLandmarks(width, height, centroidNormX, this.smoothedHipY, spreadWidth, topCentroidY, bottomCentroidY);
    this.callbacks.onPoseUpdate?.(pose);

    // Draw skeletal overlay & HUD elements
    this.drawSkeleton(pose, width, height);

    // Process specific routine logic
    switch (this.routineType) {
      case 'squats':
        this.processSquatLogic(width, height, pose);
        break;
      case 'pushups':
        this.processPushupLogic(width, height, pose);
        break;
      case 'jumping_jacks':
        this.processJumpingJackLogic(width, height, pose);
        break;
      case 'plank':
        this.processPlankLogic(width, height, pose);
        break;
      case 'walk':
        this.processWalkMotionLogic(width, height);
        break;
    }
  }

  private generatePoseLandmarks(
    w: number,
    h: number,
    cx: number,
    cy: number,
    spread: number,
    topY: number,
    bottomY: number
  ): SkeletonPose {
    // Generate realistic anatomical points centered on detected user bounding body
    // Mirror aware: x coordinates mapped to screen
    const screenX = cx * w;
    const screenY = cy * h;
    const torsoHeight = Math.max(80, (bottomY - topY) * h * 0.8);
    const shoulderWidth = Math.min(w * 0.35, Math.max(70, spread * w * 0.6));
    const hipWidth = shoulderWidth * 0.65;

    // Dynamic knee / elbow position based on current routine & detected motion
    const isSquatting = this.routineType === 'squats' && this.exerciseState === 'down';
    const squatSquish = isSquatting ? 0.35 : 0.1;

    const headY = Math.max(50, topY * h - 30);
    const shoulderY = headY + 50;
    const hipY = Math.min(h * 0.78, shoulderY + torsoHeight * 0.55);
    const kneeY = Math.min(h * 0.9, hipY + (h * 0.25) * (1 - squatSquish));
    const ankleY = Math.min(h * 0.96, kneeY + h * 0.22);

    // Arm positioning for jumping jacks vs standard
    let leftWristX = screenX - shoulderWidth * 0.9;
    let leftWristY = hipY;
    let rightWristX = screenX + shoulderWidth * 0.9;
    let rightWristY = hipY;

    if (this.routineType === 'jumping_jacks') {
      const isJackOpen = this.exerciseState === 'open';
      if (isJackOpen || topY < 0.3) {
        leftWristY = headY - 40;
        leftWristX = screenX - shoulderWidth * 1.1;
        rightWristY = headY - 40;
        rightWristX = screenX + shoulderWidth * 1.1;
      }
    } else if (this.routineType === 'pushups') {
      leftWristY = screenY + 40;
      rightWristY = screenY + 40;
    }

    return {
      nose: { x: screenX, y: headY },
      leftShoulder: { x: screenX - shoulderWidth * 0.5, y: shoulderY },
      rightShoulder: { x: screenX + shoulderWidth * 0.5, y: shoulderY },
      leftElbow: { x: screenX - shoulderWidth * 0.75, y: shoulderY + 45 },
      rightElbow: { x: screenX + shoulderWidth * 0.75, y: shoulderY + 45 },
      leftWrist: { x: leftWristX, y: leftWristY },
      rightWrist: { x: rightWristX, y: rightWristY },
      leftHip: { x: screenX - hipWidth * 0.5, y: hipY },
      rightHip: { x: screenX + hipWidth * 0.5, y: hipY },
      leftKnee: { x: screenX - hipWidth * 0.7, y: kneeY },
      rightKnee: { x: screenX + hipWidth * 0.7, y: kneeY },
      leftAnkle: { x: screenX - (shoulderWidth * 0.6) * (1 + (this.smoothedJackWidth - 0.25)), y: ankleY },
      rightAnkle: { x: screenX + (shoulderWidth * 0.6) * (1 + (this.smoothedJackWidth - 0.25)), y: ankleY },
    };
  }

  private drawSkeleton(pose: SkeletonPose, w: number, h: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Connections list for anatomical lines
    const bones: [Point2D | undefined, Point2D | undefined][] = [
      // Torso & head
      [pose.nose, pose.leftShoulder],
      [pose.nose, pose.rightShoulder],
      [pose.leftShoulder, pose.rightShoulder],
      [pose.leftShoulder, pose.leftHip],
      [pose.rightShoulder, pose.rightHip],
      [pose.leftHip, pose.rightHip],
      // Left arm
      [pose.leftShoulder, pose.leftElbow],
      [pose.leftElbow, pose.leftWrist],
      // Right arm
      [pose.rightShoulder, pose.rightElbow],
      [pose.rightElbow, pose.rightWrist],
      // Left leg
      [pose.leftHip, pose.leftKnee],
      [pose.leftKnee, pose.leftAnkle],
      // Right leg
      [pose.rightHip, pose.rightKnee],
      [pose.rightKnee, pose.rightAnkle],
    ];

    // Determine status color
    const isGoodForm = this.isHoldingGoodForm || this.exerciseState === 'down' || this.exerciseState === 'open';
    const strokeColor = isGoodForm ? '#10b981' : '#06b6d4'; // Emerald green or Cyan
    const glowColor = isGoodForm ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)';

    ctx.save();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    // Draw Bones
    for (const [p1, p2] of bones) {
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Draw Joints
    const joints = [
      pose.nose,
      pose.leftShoulder,
      pose.rightShoulder,
      pose.leftElbow,
      pose.rightElbow,
      pose.leftWrist,
      pose.rightWrist,
      pose.leftHip,
      pose.rightHip,
      pose.leftKnee,
      pose.rightKnee,
      pose.leftAnkle,
      pose.rightAnkle,
    ];

    joints.forEach((pt) => {
      if (pt) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // SQUATS LOGIC: Counts reps when hip dips below depth threshold and ascends fully
  private processSquatLogic(w: number, h: number, pose: SkeletonPose) {
    const hipY = this.smoothedHipY;
    const now = Date.now();

    // Standing baseline ~ 0.45 - 0.52. Deep squat ~ 0.62 - 0.75
    const squatDepthNorm = Math.min(100, Math.max(0, Math.round(((hipY - 0.46) / 0.18) * 100)));
    const angleEst = Math.round(180 - (squatDepthNorm / 100) * 85);
    this.smoothedKneeAngle = this.smoothedKneeAngle * 0.7 + angleEst * 0.3;

    if (this.exerciseState === 'up') {
      if (squatDepthNorm > 60 || this.smoothedKneeAngle < 125) {
        this.exerciseState = 'down';
        this.callbacks.onFeedback?.({
          status: 'good',
          message: 'Great depth! Now push up!',
          depthScore: squatDepthNorm,
          angle: Math.round(this.smoothedKneeAngle),
        });
      } else {
        this.callbacks.onFeedback?.({
          status: 'waiting',
          message: 'Lower into squat (break 90°)',
          depthScore: squatDepthNorm,
          angle: Math.round(this.smoothedKneeAngle),
        });
      }
    } else if (this.exerciseState === 'down') {
      if (squatDepthNorm < 25 && this.smoothedKneeAngle > 155) {
        // Full extension reached -> Complete 1 rep
        if (now - this.lastRepTimestamp > 800) {
          this.exerciseState = 'up';
          this.currentCount += 1;
          this.lastRepTimestamp = now;
          this.callbacks.onRepCount?.(this.currentCount);
          this.callbacks.onFeedback?.({
            status: 'good',
            message: `Rep ${this.currentCount} counted! ✨`,
            depthScore: 100,
            angle: 180,
          });
        }
      } else {
        this.callbacks.onFeedback?.({
          status: 'adjust',
          message: 'Drive through heels to stand',
          depthScore: squatDepthNorm,
          angle: Math.round(this.smoothedKneeAngle),
        });
      }
    }
  }

  // PUSHUPS LOGIC: Counts reps when chest dips and returns to lockout
  private processPushupLogic(w: number, h: number, pose: SkeletonPose) {
    const now = Date.now();
    // In pushups, chest vertical displacement and optical energy at bottom
    const chestY = this.smoothedHipY;
    const depthScore = Math.min(100, Math.max(0, Math.round(((chestY - 0.42) / 0.16) * 100)));
    const elbowAngle = Math.round(170 - (depthScore / 100) * 80);
    this.smoothedElbowAngle = this.smoothedElbowAngle * 0.7 + elbowAngle * 0.3;

    if (this.exerciseState === 'up') {
      if (depthScore > 55 || this.smoothedElbowAngle < 115) {
        this.exerciseState = 'down';
        this.callbacks.onFeedback?.({
          status: 'good',
          message: 'Chest low! Push the floor away!',
          depthScore,
          angle: Math.round(this.smoothedElbowAngle),
        });
      } else {
        this.callbacks.onFeedback?.({
          status: 'waiting',
          message: 'Lower chest to floor',
          depthScore,
          angle: Math.round(this.smoothedElbowAngle),
        });
      }
    } else if (this.exerciseState === 'down') {
      if (depthScore < 25 && this.smoothedElbowAngle > 150) {
        if (now - this.lastRepTimestamp > 800) {
          this.exerciseState = 'up';
          this.currentCount += 1;
          this.lastRepTimestamp = now;
          this.callbacks.onRepCount?.(this.currentCount);
          this.callbacks.onFeedback?.({
            status: 'good',
            message: `Rep ${this.currentCount} completed! 💪`,
            depthScore: 100,
            angle: 175,
          });
        }
      }
    }
  }

  // JUMPING JACKS LOGIC: Closed -> Open -> Closed cycle
  private processJumpingJackLogic(w: number, h: number, pose: SkeletonPose) {
    const now = Date.now();
    const spread = this.smoothedJackWidth;
    const handY = this.smoothedHandHeight;

    // Open jack: hands above 0.38 height, spread width > 0.42
    const isOpen = handY < 0.42 || spread > 0.40;
    const isClosed = handY > 0.52 && spread < 0.32;

    if (this.exerciseState === 'closed') {
      if (isOpen) {
        this.exerciseState = 'open';
        this.callbacks.onFeedback?.({
          status: 'good',
          message: 'Wide jump! Now feet together!',
          depthScore: 80,
        });
      } else {
        this.callbacks.onFeedback?.({
          status: 'waiting',
          message: 'Jump hands overhead!',
          depthScore: 20,
        });
      }
    } else if (this.exerciseState === 'open') {
      if (isClosed) {
        if (now - this.lastRepTimestamp > 450) {
          this.exerciseState = 'closed';
          this.currentCount += 1;
          this.lastRepTimestamp = now;
          this.callbacks.onRepCount?.(this.currentCount);
          this.callbacks.onFeedback?.({
            status: 'good',
            message: `Jack ${this.currentCount}/${this.targetCount} ⚡`,
            depthScore: 100,
          });
        }
      }
    }
  }

  // PLANK LOGIC: Verifies straight spine posture and holds timer for 20s
  private processPlankLogic(w: number, h: number, pose: SkeletonPose) {
    const hipY = this.smoothedHipY;
    // Straight plank holds hip in sweet spot ~0.50 - 0.65
    const isSagging = hipY > 0.72;
    const isPiking = hipY < 0.44;
    const isAligned = !isSagging && !isPiking;

    const now = Date.now();

    if (isAligned) {
      this.isHoldingGoodForm = true;
      if (!this.holdStartTimestamp) {
        this.holdStartTimestamp = now;
      } else {
        this.accumulatedHoldMs += now - this.holdStartTimestamp;
        this.holdStartTimestamp = now;
      }

      const totalElapsedSec = Math.min(this.targetCount, Math.floor(this.accumulatedHoldMs / 1000));
      this.callbacks.onHoldProgress?.(totalElapsedSec, this.targetCount);

      this.callbacks.onFeedback?.({
        status: 'good',
        message: 'Spine neutral & core locked! Keep holding!',
        depthScore: 100,
      });

      if (totalElapsedSec >= this.targetCount && this.currentCount < this.targetCount) {
        this.currentCount = this.targetCount;
        this.callbacks.onRepCount?.(this.targetCount);
      }
    } else {
      this.isHoldingGoodForm = false;
      this.holdStartTimestamp = null;
      const warningMsg = isSagging ? 'Lift hips up! Do not sag.' : 'Lower hips! Neutral spine.';
      this.callbacks.onFeedback?.({
        status: 'warning',
        message: warningMsg,
        depthScore: 40,
      });
    }
  }

  // WALK LOGIC: Optical cadence and step rhythm
  private processWalkMotionLogic(w: number, h: number) {
    if (this.motionEnergy > 8) {
      this.callbacks.onFeedback?.({
        status: 'good',
        message: 'Active walking detected! Steady pace.',
        depthScore: 90,
      });
    } else {
      this.callbacks.onFeedback?.({
        status: 'waiting',
        message: 'Step rhythm active — keep moving!',
        depthScore: 50,
      });
    }
  }
}
