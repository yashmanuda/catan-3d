export class DiceBox {
    constructor() {
        this.isRolling = false;
        this.dice = [];
        this.rollSound = new Audio('/src/assets/dice_roll.wav');
        this.rollSound.volume = 0.4;
        
        // Create container
        this.element = document.createElement('div');
        this.element.style.cssText = `
            position: fixed;
            top: calc(20px + 450px); /* Position below resource section */
            right: 20px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(8px);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: row;
            gap: 15px;
            z-index: 1000;
        `;

        // Create two dice
        for (let i = 0; i < 2; i++) {
            const die = document.createElement('div');
            die.style.cssText = `
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                color: #333;
                font-family: 'Poppins', sans-serif;
            `;
            die.textContent = '1';
            this.element.appendChild(die);
            this.dice.push(die);
        }

        document.body.appendChild(this.element);
    }

    rollDice() {
        if (this.isRolling) return Promise.reject('Already rolling');
        this.isRolling = true;

        return new Promise((resolve) => {
            // Play dice sound
            this.rollSound.currentTime = 0;
            this.rollSound.play().catch(e => console.warn('Audio play failed:', e));

            const totalDuration = 1500; // 1.5 seconds
            const numRolls = 20;
            const startTime = Date.now();
            const rotationSum = [0, 0];
            const finalValues = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / totalDuration;

                if (progress < 1) {
                    this.dice.forEach((die, index) => {
                        rotationSum[index] += 360;
                        // Faster rotation at start, slower at end with easing
                        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
                        const scale = 1 + (Math.sin(progress * Math.PI) * 0.2); // Increased bounce effect
                        const speed = 1 - easeOut;
                        die.style.transform = `rotate(${rotationSum[index] * speed}deg) scale(${scale})`;
                        die.textContent = Math.floor(Math.random() * 6) + 1;
                        die.style.background = `rgba(255, 255, 255, ${0.9 - (Math.sin(progress * Math.PI) * 0.1)})`; // Subtle opacity animation
                    });
                    requestAnimationFrame(animate);
                } else {
                    // Final values with a small bounce
                    this.dice.forEach((die, index) => {
                        die.style.transform = 'rotate(0deg) scale(1.1)';
                        die.textContent = finalValues[index];
                        die.style.background = 'rgba(255, 255, 255, 0.9)';
                        
                        // Small bounce back to normal scale
                        setTimeout(() => {
                            die.style.transform = 'rotate(0deg) scale(1)';
                        }, 50);
                    });

                    this.isRolling = false;
                    const total = finalValues[0] + finalValues[1];
                    console.log('Rolled:', total);
                    resolve(total);
                }
            };

            requestAnimationFrame(animate);
        });
    }
} 