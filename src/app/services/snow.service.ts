import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnowService {
  private snowflakeChars = ['❄', '❅', '❆', '✦', '✧', '✩', '🎁', '⭐', '🔔'];

  createSnowfall(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!document.getElementById('snowfall-animation-style')) {
      const style = document.createElement('style');
      style.id = 'snowfall-animation-style';
      style.textContent = `
        @keyframes fall {
          from { transform: translateY(-100px) rotate(0deg); }
          to { transform: translateY(100vh) rotate(360deg); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .snowflake {
          position: absolute;
          top: -50px;
          z-index: 9999;
          user-select: none;
          pointer-events: none;
          animation: fall linear infinite;
        }
      `;
      document.head.appendChild(style);
    }

    setInterval(() => {
      this.createSnowflake(container);
    }, 250);

    setInterval(() => {
      this.createMagicalSnowflake(container);
    }, 3000);
  }

  private createSnowflake(container: HTMLElement): void {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = this.snowflakeChars[Math.floor(Math.random() * this.snowflakeChars.length)];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = (Math.random() * 4 + 3).toString() + 's';
    snowflake.style.opacity = (Math.random() * 0.8 + 0.2).toString();
    snowflake.style.fontSize = (Math.random() * 15 + 10).toString() + 'px';
    const rotationSpeed = Math.random() * 360 + 180;
    snowflake.style.animation = `fall ${snowflake.style.animationDuration} linear infinite, rotate ${rotationSpeed}s linear infinite`;
    if (['🎁', '⭐', '🔔'].includes(snowflake.innerHTML)) {
      snowflake.style.filter = `hue-rotate(${Math.random() * 60}deg) brightness(1.2)`;
    }
    container.appendChild(snowflake);
    setTimeout(() => {
      if (snowflake.parentNode) {
        snowflake.remove();
      }
    }, 7000);
  }

  private createMagicalSnowflake(container: HTMLElement): void {
    const magicElement = document.createElement('div');
    magicElement.className = 'snowflake';
    magicElement.innerHTML = '✨';
    magicElement.style.left = Math.random() * 100 + '%';
    magicElement.style.fontSize = '20px';
    magicElement.style.color = '#FFD700';
    magicElement.style.animationDuration = '6s';
    magicElement.style.textShadow = '0 0 10px #FFD700';
    container.appendChild(magicElement);
    setTimeout(() => {
      if (magicElement.parentNode) {
        magicElement.remove();
      }
    }, 6000);
  }
}
