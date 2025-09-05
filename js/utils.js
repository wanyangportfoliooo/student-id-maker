// utils.js - 工具函數

// 通用工具函數
const Utils = {
    
    // 等待指定時間
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 生成隨機ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // 格式化日期
    formatDate(date = new Date(), format = 'YYYY/MM/DD') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    // 驗證電子郵件
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // 驗證手機號碼（台灣）
    validatePhone(phone) {
        const re = /^09\d{8}$/;
        return re.test(phone.replace(/\D/g, ''));
    },

    // 檔案大小格式化
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 圖片尺寸檢查
    checkImageSize(file, maxSizeMB = 5) {
        const maxSize = maxSizeMB * 1024 * 1024; // 轉換為bytes
        return file.size <= maxSize;
    },

    // 圖片類型檢查
    checkImageType(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return allowedTypes.includes(file.type);
    },

    // 壓縮圖片
    async compressImage(file, quality = 0.8, maxWidth = 800) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 計算新尺寸
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // 繪製並壓縮
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    },

    // Base64轉Blob
    base64ToBlob(base64, mimeType = 'image/png') {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    },

    // Blob轉Base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    // 獲取圖片尺寸
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    },

    // 下載檔案
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // 複製到剪貼簿
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('複製失敗:', error);
            return false;
        }
    },

    // 瀏覽器檢測
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            browser,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isIOS: /iPad|iPhone|iPod/.test(ua),
            isAndroid: /Android/.test(ua)
        };
    },

    // 裝置檢測
    getDeviceInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
    },

    // 節流函數
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 防抖函數
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    // 深拷貝
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    },

    // URL 參數處理
    url: {
        getParams() {
            const params = {};
            const urlParams = new URLSearchParams(window.location.search);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
            return params;
        },

        setParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },

        removeParam(key) {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            window.history.pushState({}, '', url);
        }
    },

    // 錯誤處理
    handleError(error, context = '未知') {
        console.error(`錯誤發生於 ${context}:`, error);
        
        return {
            message: error.message || '發生未知錯誤',
            context,
            timestamp: new Date().toISOString()
        };
    },

    // 載入狀態管理
    loading: {
        show(message = '載入中...') {
            const loading = document.getElementById('loading');
            if (loading) {
                const text = loading.querySelector('p');
                if (text) text.textContent = message;
                loading.classList.remove('hidden');
            }
        },

        hide() {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
            }
        }
    },

    // 通知系統（簡化版）
    notify: {
        success(message) {
            this.show(message, 'success');
        },

        error(message) {
            this.show(message, 'error');
        },

        info(message) {
            this.show(message, 'info');
        },

        show(message, type = 'info') {
            const emoji = {
                success: '✅',
                error: '❌',
                info: 'ℹ️'
            };
            
            alert(`${emoji[type]} ${message}`);
        }
    },

    // 表單驗證
    validate: {
        required(value) {
            return value !== null && value !== undefined && String(value).trim() !== '';
        },

        minLength(value, min) {
            return String(value).length >= min;
        },

        maxLength(value, max) {
            return String(value).length <= max;
        },

        pattern(value, regex) {
            return regex.test(String(value));
        },

        number(value) {
            return !isNaN(value) && isFinite(value);
        }
    }
};

// 全域可用
window.Utils = Utils;

// 錯誤監聽
window.addEventListener('error', (event) => {
    Utils.handleError(event.error, 'Global Error Handler');
});

// 未處理的 Promise 拒絕
window.addEventListener('unhandledrejection', (event) => {
    Utils.handleError(event.reason, 'Unhandled Promise Rejection');
});

console.log('工具函數載入完成');
