// canvas.js - 圖片合成功能

class CanvasManager {
    constructor() {
        this.templateImage = null;
        this.templateLoaded = false;
        this.setupCanvasExtensions();
    }

    // 載入學生證模板
    async loadTemplate(templatePath = 'assets/images/student-card-template.png') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // 處理跨域問題
            
            img.onload = () => {
                this.templateImage = img;
                this.templateLoaded = true;
                console.log('學生證模板載入成功');
                resolve(img);
            };
            
            img.onerror = (error) => {
                console.error('學生證模板載入失敗:', error);
                // 模板載入失敗時，使用簡單模板
                this.templateLoaded = false;
                console.log('將使用簡單模板');
                resolve(null);
            };
            
            img.src = templatePath;
        });
    }

    // 生成學生證
    async generateCard(userData) {
        try {
            // 嘗試載入模板（如果失敗會使用簡單模板）
            if (!this.templateLoaded) {
                await this.loadTemplate();
            }

            if (!userData.photo) {
                throw new Error('缺少用戶照片');
            }

            // 創建canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 設定canvas尺寸 (學生證尺寸)
            const cardWidth = 600;
            const cardHeight = 400;
            canvas.width = cardWidth;
            canvas.height = cardHeight;

            // 如果有模板圖片，使用模板
            if (this.templateImage && this.templateLoaded) {
                ctx.drawImage(this.templateImage, 0, 0, cardWidth, cardHeight);
            } else {
                // 沒有模板時創建簡單背景
                this.drawSimpleTemplate(ctx, cardWidth, cardHeight);
            }

            // 載入並處理用戶照片
            const userPhoto = await this.loadUserPhoto(userData.photo);
            
            // 繪製用戶照片到指定位置
            this.drawUserPhoto(ctx, userPhoto);
            
            // 繪製用戶資訊文字
            this.drawUserInfo(ctx, userData, cardWidth, cardHeight);
            
            // 添加學校logo和其他裝飾
            this.drawDecorations(ctx, cardWidth, cardHeight);

            // 添加浮水印
            this.addWatermark(ctx, cardWidth, cardHeight);

            console.log('學生證生成成功');
            return canvas;

        } catch (error) {
            console.error('生成學生證失敗:', error);
            throw error;
        }
    }

    // 載入用戶照片
    loadUserPhoto(photoData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('用戶照片載入失敗'));
            img.src = photoData;
        });
    }

    // 繪製簡單模板（當沒有設計稿時的備用方案）
    drawSimpleTemplate(ctx, width, height) {
        // 背景漸層
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 白色卡片區域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.roundRect(20, 20, width - 40, height - 40, 15);
        ctx.fill();

        // 標題區域
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STUDENT ID CARD', width / 2, 70);

        // 年份
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText('2024', width / 2, 95);

        // 頂部裝飾線
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(40, 100, width - 80, 3);
    }

    // 繪製用戶照片
    drawUserPhoto(ctx, userPhoto) {
        // 照片位置和尺寸 (可根據實際模板調整)
        const photoX = 50;
        const photoY = 120;
        const photoWidth = 120;
        const photoHeight = 150;

        // 保存當前狀態
        ctx.save();

        // 創建圓角遮罩
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoWidth, photoHeight, 8);
        ctx.clip();

        // 計算照片縮放比例，保持長寬比
        const scale = Math.max(photoWidth / userPhoto.width, photoHeight / userPhoto.height);
        const scaledWidth = userPhoto.width * scale;
        const scaledHeight = userPhoto.height * scale;

        // 居中繪製
        const offsetX = photoX + (photoWidth - scaledWidth) / 2;
        const offsetY = photoY + (photoHeight - scaledHeight) / 2;

        ctx.drawImage(userPhoto, offsetX, offsetY, scaledWidth, scaledHeight);

        // 恢復狀態
        ctx.restore();

        // 照片邊框
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoWidth, photoHeight, 8);
        ctx.stroke();
    }

    // 繪製用戶資訊
    drawUserInfo(ctx, userData, cardWidth, cardHeight) {
        const textX = 200; // 文字起始X位置
        let textY = 150; // 文字起始Y位置

        // 設定文字樣式
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';

        // 姓名
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('姓名:', textX, textY);
        ctx.font = '22px Arial, sans-serif';
        ctx.fillText(userData.name || '未填寫', textX + 70, textY);
        textY += 40;

        // 性別
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('性別:', textX, textY);
        ctx.font = '18px Arial, sans-serif';
        const genderText = userData.gender === 'male' ? '男' : 
                          userData.gender === 'female' ? '女' : '未填寫';
        ctx.fillText(genderText, textX + 70, textY);
        textY += 40;

        // 學號 (隨機生成)
        const studentId = this.generateStudentId();
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('學號:', textX, textY);
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(studentId, textX + 70, textY);
        textY += 40;

        // 科系
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('科系:', textX, textY);
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText('AI設計學系', textX + 70, textY);
    }

    // 繪製裝飾元素
    drawDecorations(ctx, cardWidth, cardHeight) {
        // 日期
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`發證日期: ${year}/${month}/${day}`, cardWidth - 30, cardHeight - 50);

        // 底部條紋
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(0, cardHeight - 20, cardWidth, 20);

        // 學校名稱
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AI DESIGN SCHOOL', cardWidth / 2, cardHeight - 8);

        // QR碼位置標記
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(cardWidth - 80, 120, 60, 60);
        ctx.fillStyle = '#ccc';
        ctx.font = '10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR CODE', cardWidth - 50, 155);

        // 裝飾圖案
        this.drawPattern(ctx, cardWidth, cardHeight);
    }

    // 繪製裝飾圖案
    drawPattern(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ff69b4';
        
        // 繪製一些裝飾圓點
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 20 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    // 生成學號
    generateStudentId() {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        return `${year}${randomNum}`;
    }

    // Canvas圓角矩形擴展
    setupCanvasExtensions() {
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
                if (width < 2 * radius) radius = width / 2;
                if (height < 2 * radius) radius = height / 2;
                
                this.beginPath();
                this.moveTo(x + radius, y);
                this.arcTo(x + width, y, x + width, y + height, radius);
                this.arcTo(x + width, y + height, x, y + height, radius);
                this.arcTo(x, y + height, x, y, radius);
                this.arcTo(x, y, x + width, y, radius);
                this.closePath();
                
                return this;
            };
        }
    }

    // 圖片質量優化
    optimizeImage(canvas, quality = 0.9) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                resolve(url);
            }, 'image/png', quality);
        });
    }

    // 添加浮水印
    addWatermark(ctx, width, height, text = '僅供娛樂使用') {
        ctx.save();
        
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
    }

    // 預覽功能
    previewCard(userData, previewElement) {
        this.generateCard(userData).then(canvas => {
            const ctx = previewElement.getContext('2d');
            previewElement.width = canvas.width;
            previewElement.height = canvas.height;
            ctx.drawImage(canvas, 0, 0);
        }).catch(error => {
            console.error('預覽失敗:', error);
        });
    }

    // 檢查瀏覽器支援
    static isSupported() {
        return !!(
            window.HTMLCanvasElement &&
            CanvasRenderingContext2D
        );
    }
}

// 初始化Canvas管理器
document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager();
    window.CanvasManager = canvasManager;
    console.log('圖片合成功能已載入');
});
