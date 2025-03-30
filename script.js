console.log('Script loaded successfully!');

const open = document.querySelector('.open');

const close = document.querySelector('.close');

const leftContainer = document.querySelector('.leftContainer');

console.log(leftContainer);

open.addEventListener('click', () => {
    leftContainer.style.left = '0px';    
});

close.addEventListener('click', () => {
    leftContainer.style.left = '-100%';    
});