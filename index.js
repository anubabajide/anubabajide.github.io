const variables = Array.from(document.querySelectorAll(".section-head"));
const status = [];

for (var i = 0; i<variables.length; i++) {
    status.push(false);
}

const elements = [
    `<div class="section-text" id="add-0"> 
<p>I am a learner, eater and engineer(in that order), who studied computer engineering and fell in love with programming (and chess)_
Now I build beautiful apps while writing even better code_</p>
</div>`, 
`<div class="section-text" id="add-1">
<p><a href="https://github.com/anubabajide/Coding-Challenges" target="_blank" rel="noopener noreferrer">Efficient algorithms</a> [or I try to]_ 
[like this one and others in the links (I have done)]_ 
Scripts to automate boring tasks [why not?]_
Robot applications on raspberry-pi and arduino [calm down, as a hobby, see (I have done)]_</p>
</div>`,
`<div class="section-text" id="add-2"> 
<p>Trick question, as long as it can be learned, I can use it_</p>
</div>`,
`<div class="section-text" id="add-3"> 
<p><a href="https://anubabajide.github.io/Forkify/" target="_blank" rel="noopener noreferrer">Forkify</a>, a cool food recipe and shopping website [Vanilla JS]_</p>
<p><a href="https://anubabajide.github.io/Budgety/" target="_blank" rel="noopener noreferrer">Budgety</a>, a simple income and expense budget calculation app [Vanilla JS]_</p>
<p><a href="https://partner-learn.herokuapp.com/" target="_blank" rel="noopener noreferrer">Partner Learn</a>, an innovative website to pair up with friends and learn efficeint DSA design [React - Flask]_</p>
<p><a href="https://github.com/anubabajide/Maze-Runner" target="_blank" rel="noopener noreferrer">Maze Runner</a>, a robot that solves mazes!_</p>
</div>`,
`<div class="section-text" id="add-4"> 
<p><a href="https://1drv.ms/b/s!AutTpnFLDtu5snENL1UUB4GoB3Ai?e=KUStHd" target="_blank" rel="noopener noreferrer">My CV_</a></p>
</div>`
];

variables.map((el, index) => {
    el.addEventListener('click', guy =>  {
        console.log(index, el);
        if (index < 5){
            if (!status[index]) {
                el.insertAdjacentHTML('afterend', elements[index]);
            } else {
                const child = document.getElementById(`add-${index}`);
                child.parentElement.removeChild(child);
            }
            status[index] = !status[index];
        }
    })
});

