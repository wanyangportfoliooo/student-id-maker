// main.js - 主要控制邏輯

class StudentIDApp {
    constructor() {
        this.currentPage = 1;
        this.userData = {
            name: '',
            gender: '',
            photo: null
        };
        this.init();
    }

    init() {
        console.log('學生證製作器初始化...');
        this.bindEvents();
        this.showPage(1);
    }

    // 綁定所有事件
    bindEvents() {
        // 頁面 1: 首頁按鈕
        document.getElementById('startBtn').addEventListener('click', () => {
            this.nextPage();
        });

        // 頁面 2: 說明頁按鈕
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.nextPage();
        });

        // 頁面 3: 拍照頁按鈕
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });

        document.getElementById('retakeBtn').addEventListener('click', () => {
            this.retakePhoto();
        });

        document.getElementById('confirmPhotoBtn').addEventListener('click', () => {
            this.confirmPhoto();
        });

        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // 頁面 4: 表單提交
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // 頁面 6: 下載和分享
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadCard();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareCard();
        });
    }

    // 頁面切換
    showPage(pageNumber) {
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 顯示目標頁面
        const targetPage = document.getElementById(`page${pageNumber}`);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.classList.add('fade-enter');
            
            // 移除動畫類別
            setTimeout(() => {
                targetPage.classList.remove('fade-enter');
            }, 300);
        }

        this.currentPage = pageNumber;
        console.log(`切換到頁面 ${pageNumber}`);

        // 頁面特定初始化
        this.initPageSpecific(pageNumber);
    }

    // 下一頁
    nextPage() {
        if (this.currentPage < 6) {
            this.showPage(this.currentPage + 1);
        }
    }

    // 頁面特定初始化
    initPageSpecific(pageNumber) {
        switch(pageNumber) {
            case 3:
                // 初始化相機
                this.initCamera();
                break;
            case 5:
                // 開始處理動畫
                this.startProcessing();
                break;
        }
    }

    // 初始化相機
    async initCamera() {
        try {
            await window.CameraManager.init();
            console.log('相機初始化成功');
        } catch (error) {
            console.error('相機初始化失敗:', error);
            this.showError('無法啟動相機，請檢查權限設定');
        }
    }

    // 拍照
    async capturePhoto() {
        try {
            this.showLoading('拍照中...');
            
            const photoData = await window.CameraManager.capture();
            this.userData.photo = photoData;
            
            this.hideLoading();
            this.showCapturedPhoto();
            
        } catch (error) {
            this.hideLoading();
            console.error('拍照失敗:', error);
            this.showError('拍照失敗，請重試');
        }
    }

    // 重拍
    retakePhoto() {
        window.CameraManager.retake();
        this.hideCapturedPhoto();
    }

    // 確認照片
    confirmPhoto() {
        if (this.userData.photo) {
            this.nextPage();
        } else {
            this.showError('請先拍攝照片');
        }
    }

    // 顯示拍攝的照片
    showCapturedPhoto() {
        document.getElementById('captureBtn').classList.add('hidden');
        document.getElementById('retakeBtn').classList.remove('hidden');
        document.getElementById('confirmPhotoBtn').classList.remove('hidden');
    }

    // 隱藏拍攝的照片
    hideCapturedPhoto() {
        document.getElementById('captureBtn').classList.remove('hidden');
        document.getElementById('retakeBtn').classList.add('hidden');
        document.getElementById('confirmPhotoBtn').classList.add('hidden');
    }

    // 處理檔案上傳
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.showLoading('處理圖片中...');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.userData.photo = e.target.result;
                this.hideLoading();
                this.showCapturedPhoto();
                
                // 顯示預覽
                window.CameraManager.showPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            this.showError('請選擇有效的圖片檔案');
        }
    }

    // 提交表單
    submitForm() {
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        
        // 驗證表單
        if (!this.validateForm(formData)) {
            return;
        }

        // 儲存用戶資料
        this.userData.name = formData.get('userName') || document.getElementById('userName').value;
        this.userData.gender = formData.get('gender');

        console.log('用戶資料:', this.userData);

        // 前往處理頁面
        this.nextPage();
    }

    // 表單驗證
    validateForm(formData) {
        const name = formData.get('userName') || document.getElementById('userName').value;
        const gender = formData.get('gender');
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // 清除之前的錯誤
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

        let isValid = true;

        if (!name || name.trim().length < 1) {
            this.showFieldError('userName', '請輸入姓名');
            isValid = false;
        }

        if (!gender) {
            this.showFieldError('gender', '請選擇性別');
            isValid = false;
        }

        if (!agreeTerms) {
            this.showFieldError('agreeTerms', '請同意使用條款');
            isValid = false;
        }

        return isValid;
    }

    // 顯示欄位錯誤
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        if (field) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
            }
        }
        this.showError(message);
    }

    // 開始處理動畫
    startProcessing() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.classList.add('animate');
        }

        // 模擬處理時間 (10秒)
        setTimeout(() => {
            this.generateStudentCard();
        }, 10000);
    }

    // 生成學生證
    async generateStudentCard() {
        try {
            this.showLoading('生成學生證中...');
            
            const cardCanvas = await window.CanvasManager.generateCard(this.userData);
            
            // 顯示最終學生證
            const finalCard = document.getElementById('finalCard');
            const ctx = finalCard.getContext('2d');
            finalCard.width = cardCanvas.width;
            finalCard.height = cardCanvas.height;
            ctx.drawImage(cardCanvas, 0, 0);
            
            this.hideLoading();
            this.nextPage(); // 前往第6頁
            
            // 添加卡片顯示動畫
            setTimeout(() => {
                finalCard.classList.add('card-reveal');
            }, 100);
            
        } catch (error) {
            this.hideLoading();
            console.error('生成學生證失敗:', error);
            this.showError('生成學生證失敗，請重試');
        }
    }

    // 下載學生證
    downloadCard() {
        try {
            const canvas = document.getElementById('finalCard');
            if (!canvas) {
                this.showError('找不到學生證圖片');
                return;
            }

            // 創建下載連結
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${this.userData.name || 'student'}_id_card.png`;
                
                // 觸發下載
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 清理 URL
                URL.revokeObjectURL(url);
                
                this.showSuccess('學生證已下載！');
            }, 'image/png', 0.9);
            
        } catch (error) {
            console.error('下載失敗:', error);
            this.showError('下載失敗，請重試');
        }
    }

    // 分享學生證
    shareCard() {
        try {
            const canvas = document.getElementById('finalCard');
            if (!canvas) {
                this.showError('找不到學生證圖片');
                return;
            }

            // 檢查是否支援 Web Share API
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], `${this.userData.name || 'student'}_id_card.png`, {
                        type: 'image/png'
                    });

                    if (navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: '我的專屬學生證',
                                text: '看看我的AI學生證！',
                                files: [file]
                            });
                            this.showSuccess('分享成功！');
                        } catch (error) {
                            if (error.name !== 'AbortError') {
                                this.fallbackShare();
                            }
                        }
                    } else {
                        this.fallbackShare();
                    }
                }, 'image/png', 0.9);
            } else {
                this.fallbackShare();
            }
        } catch (error) {
            console.error('分享失敗:', error);
            this.fallbackShare();
        }
    }

    // 備用分享方法
    fallbackShare() {
        const shareOption = confirm('要開啟社群分享嗎？\n確定：Facebook\n取消：下載圖片');
        
        if (shareOption) {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
        } else {
            this.downloadCard();
        }
    }

    // 顯示載入畫面
    showLoading(message = '處理中...') {
        const loading = document.getElementById('loading');
        const loadingText = loading.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loading.classList.remove('hidden');
    }

    // 隱藏載入畫面
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    // 顯示錯誤訊息
    showError(message) {
        alert(`錯誤：${message}`);
    }

    // 顯示成功訊息
    showSuccess(message) {
        alert(`成功：${message}`);
    }
}

// 頁面載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，初始化應用程式...');
    window.app = new StudentIDApp();
});

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('全域錯誤:', event.error);
});

// 阻止頁面刷新時的警告
window.addEventListener('beforeunload', (event) => {
    if (window.app && window.app.userData.photo) {
        event.preventDefault();
        event.returnValue = '';
    }
});
