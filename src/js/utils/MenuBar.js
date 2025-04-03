export class MenuBar {
    constructor(onRotateStart, onRotateEnd, onSettlementClick, onRoadClick, onRollDiceClick) {
        const menuBar = document.createElement('div');
        menuBar.style.position = 'fixed';
        menuBar.style.bottom = '20px';
        menuBar.style.left = '50%';
        menuBar.style.transform = 'translateX(-50%)';
        menuBar.style.display = 'flex';
        menuBar.style.gap = '10px';
        menuBar.style.padding = '10px';
        menuBar.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        menuBar.style.borderRadius = '10px';
        menuBar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';

        // Rotate button
        const rotateButton = document.createElement('button');
        rotateButton.textContent = '🔄 Rotate';
        rotateButton.className = 'menu-button';

        // Settlement button
        const settlementButton = document.createElement('button');
        settlementButton.textContent = '🏠 Place Settlement';
        settlementButton.className = 'menu-button';

        // Road button
        const roadButton = document.createElement('button');
        roadButton.textContent = '🛣️ Place Road';
        roadButton.className = 'menu-button';

        // Roll Dice button
        const rollDiceButton = document.createElement('button');
        rollDiceButton.textContent = '🎲 Roll Dice';
        rollDiceButton.className = 'menu-button';
        
        // Style buttons
        const buttons = [rotateButton, settlementButton, roadButton, rollDiceButton];
        buttons.forEach(button => {
            button.style.padding = '10px 20px';
            button.style.fontSize = '16px';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.style.transition = 'background-color 0.3s';

            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#45a049';
            });

            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '#4CAF50';
            });
        });

        // Handle rotate button events
        let isRotating = false;
        let rotateTimeout;

        rotateButton.addEventListener('mousedown', () => {
            isRotating = true;
            onRotateStart();
            
            // Continue rotation while held
            const continueRotation = () => {
                if (isRotating) {
                    rotateTimeout = setTimeout(continueRotation, 100);
                }
            };
            continueRotation();
        });

        rotateButton.addEventListener('mouseup', () => {
            isRotating = false;
            clearTimeout(rotateTimeout);
            onRotateEnd();
        });

        rotateButton.addEventListener('mouseleave', () => {
            if (isRotating) {
                isRotating = false;
                clearTimeout(rotateTimeout);
                onRotateEnd();
            }
        });

        rotateButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isRotating = true;
            onRotateStart();
        });

        rotateButton.addEventListener('touchend', () => {
            isRotating = false;
            clearTimeout(rotateTimeout);
            onRotateEnd();
        });

        rotateButton.addEventListener('touchcancel', () => {
            isRotating = false;
            clearTimeout(rotateTimeout);
            onRotateEnd();
        });
        
        settlementButton.addEventListener('click', onSettlementClick);
        roadButton.addEventListener('click', onRoadClick);
        rollDiceButton.addEventListener('click', onRollDiceClick);
        
        // Add buttons to menu bar
        menuBar.appendChild(rotateButton);
        menuBar.appendChild(settlementButton);
        menuBar.appendChild(roadButton);
        menuBar.appendChild(rollDiceButton);
        
        // Add menu bar to document
        document.body.appendChild(menuBar);
    }
} 