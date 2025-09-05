// camera.js - 相機管理功能

class CameraManager {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.currentPhoto = null;
    }

    // 初始化相機
    async init() {
        try {
            this.video = document.getElementById('camera');
            this.canvas = document.getElementById('preview');
            this.context = this.canvas.getContext('2d');

            // 請求相機權限
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user' // 前置鏡頭
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // 等待視頻載入
            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    console.log('相機啟動成功');
                    resolve();
                };
                
                this.video.onerror = (error) => {
                    console.error('視頻載入失敗:', error);
                    reject(error);
                };
            });

        } catch (error) {
            console.error('相機初始化失敗:', error);
            throw new Error('無法啟動相機，請檢查瀏覽器權限');
        }
    }

    // 拍照
    async capture() {
        try {
            if (!this.video || !this.canvas) {
                throw new Error('相機未初始化');
            }

            // 設定canvas尺寸
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            // 繪製當前視頻幀到canvas
            this.context.drawImage(this.video, 0, 0);

            // 添加拍照動畫效果
            this.addFlashEffect();

            // 轉換為base64
            const photoData = this.canvas.toDataURL('image/png', 0.9);
            this.currentPhoto = photoData;

            // 顯示預覽
            this.showPreview(photoData);

            console.log('拍照成功');
            return photoData;

        } catch (error) {
            console.error('拍照失敗:', error);
            throw error;
        }
    }

    // 顯示預覽
    showPreview(photoData) {
        // 隱藏video，顯示canvas
        this.video.style.display = 'none';
        this.canvas.style.display = 'block';

        // 如果傳入新的照片數據，則更新canvas
        if (photoData) {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.context.drawImage(img, 0, 0);
            };
            img.src = photoData;
        }
    }

    // 重拍
    retake() {
        try {
            // 顯示video，隱藏canvas
            this.video.style.display = 'block';
            this.canvas.style.display = 'none';
            
            this.currentPhoto = null;
            console.log('重新開始拍照');

        } catch (error) {
            console.error('重拍失敗:', error);
        }
    }

    // 添加閃光效果
    addFlashEffect() {
        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.classList.add('camera-flash');
            
            setTimeout(() => {
                cameraContainer.classList.remove('camera-flash');
            }, 600);
        }
    }

    // 切換前後鏡頭
    async switchCamera() {
        try {
            if (!this.stream) return;

            // 停止當前串流
            this.stop();

            // 切換鏡頭模式
            const currentConstraints = this.stream.getVideoTracks()[0].getSettings();
            const newFacingMode = currentConstraints.facingMode === 'user' ? 'environment' : 'user';

            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: newFacingMode
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
                this.video.onerror = reject;
            });

        } catch (error) {
            console.error('切換鏡頭失敗:', error);
            // 如果切換失敗，重新初始化原鏡頭
            await this.init();
        }
    }

    // 調整圖片質量
    adjustImageQuality(imageData, quality = 0.8) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                // 設定輸出尺寸（可以調整）
                const maxWidth = 800;
                const maxHeight = 600;
                
                let { width, height } = img;
                
                // 保持比例縮放
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;

                // 繪製並壓縮
                ctx.drawImage(img, 0, 0, width, height);
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            img.src = imageData;
        });
    }

    // 檢測人臉位置（簡化版本）
    detectFacePosition(imageData) {
        // 這裡返回一個預設的人臉位置
        // 實際項目中可以集成 face-api.js 或其他人臉檢測庫
        return {
            x: 0.3,  // 相對位置 (0-1)
            y: 0.2,
            width: 0.4,
            height: 0.6
        };
    }

    // 停止相機
    stop() {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }
            
            if (this.video) {
                this.video.srcObject = null;
            }
            
            console.log('相機已停止');
            
        } catch (error) {
            console.error('停止相機失敗:', error);
        }
    }

    // 獲取支援的相機設備
    async getDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log('可用相機設備:', cameras);
            return cameras;
            
        } catch (error) {
            console.error('獲取設備列表失敗:', error);
            return [];
        }
    }

    // 檢查瀏覽器支援
    static isSupported() {
        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            window.HTMLCanvasElement
        );
    }

    // 請求權限
    static async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('相機權限被拒絕:', error);
            return false;
        }
    }

    // 獲取當前照片
    getCurrentPhoto() {
        return this.currentPhoto;
    }

    // 清除當前照片
    clearCurrentPhoto() {
        this.currentPhoto = null;
        this.retake();
    }
}

// 創建全域實例
window.CameraManager = new CameraManager();

// 頁面卸載時停止相機
window.addEventListener('beforeunload', () => {
    if (window.CameraManager) {
        window.CameraManager.stop();
    }
});

// 頁面可見性變化時處理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 頁面隱藏時暫停相機（節省資源）
        if (window.CameraManager && window.CameraManager.video) {
            window.CameraManager.video.pause();
        }
    } else {
        // 頁面重新可見時恢復相機
        if (window.CameraManager && window.CameraManager.video) {
            window.CameraManager.video.play();
        }
    }
});
