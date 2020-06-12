//
//splash screen
//

const splash = document.querySelector('.splash');

document.addEventListener('DOMContentLoaded', (e)=>{
  setTimeout(() =>{
    splash.classList.add('display-none');
  }, 3000);
})


//
//pixiJS initialization
//

let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}
//Create a Pixi Application
let app = new PIXI.Application({
    width: 256, // default: 800
    height: 256, // default: 600
    antialias: true, // default: false
    transparent: false, // default: false
    resolution: 1 // default: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let largestDimension;
let smallestDimension;

const orbitLineWidth = 2;

if (WIDTH > HEIGHT) {
    largestDimension = WIDTH
    smallestDimension = HEIGHT;
} else {
    largestDimension = HEIGHT;
    smallestDimension = WIDTH;
}


const SQUARE_SIZE = smallestDimension / 550;

NO_SQUARES_X = WIDTH / SQUARE_SIZE + 1;
NO_SQUARES_Y = HEIGHT / SQUARE_SIZE + 1;
//
// pixiJS intitilization end
//

function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
    }
    var c = "0x" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
    return (c);
}

//
//graphics objects
//

let planetGraphics = {
    longExposure : false,
    filledCircle: new PIXI.Graphics,
    drawFilledCircles: function (coordColor) {
        this.clear();
        for (let i = 0; i < coordColor.length; i += 4) {
            this.filledCircle.beginFill(coordColor[i + 3]).drawCircle(coordColor[i], coordColor[i + 1], coordColor[i + 2]);
            this.filledCircle.endFill();
        }
    },
    init: function () {
        app.stage.addChild(this.filledCircle);
    },
    clear: function () {
        if(!this.longExposure) { this.filledCircle.clear(); }
    },
    forceClear: function(){
        this.filledCircle.clear();
    }
}
let backgroundGraphics = {
    squares: new PIXI.Graphics,
    drawSquares: function (coordColor) {
        this.squares.clear();
        let colorCount = 0;
        for (let i = 0; i < coordColor.length; i += 3) {
            this.squares.beginFill(coordColor[i + 2]);
            this.squares.drawRect(coordColor[i] * SQUARE_SIZE, coordColor[i + 1] * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            this.squares.endFill();
        }
    },
    init: function () {
        app.stage.addChild(this.squares);
    },

    clear: function () {
        this.squares.clear();
    }

}
let orbitGraphics = {
    hollowCircle: new PIXI.Graphics,
    drawHollowCircles: function (coordColor) {
        this.hollowCircle.clear();
        for (let i = 0; i < coordColor.length; i += 4) {
            this.hollowCircle.lineStyle(orbitLineWidth, coordColor[i + 3]).drawCircle(coordColor[i], coordColor[i + 1], coordColor[i + 2]);
        }
    },
    init: function () {
        app.stage.addChild(this.hollowCircle);
    },
    clear: function () {
        this.hollowCircle.clear();
    }

}
let keyGraphics = {
     squareTab: new PIXI.Graphics,
     drawkey : function(colors) {
         let height = HEIGHT / 30;
         this.squareTab.clear();
         
         for( let i = 0; i < colors.length; i++)
         {
            this.squareTab.beginFill(  rainbow(1,colors[i]) );
            this.squareTab.drawRect( 10, (HEIGHT - 10 - height) - ( i * height) - (i * 10), height, height);
            this.squareTab.endFill();
         }
         

     },
     init : function (){
         app.stage.addChild(this.squareTab);    
     }
}
let textGraphics = {
    style : new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "#ffffff",
    }),
    authorStyle : new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#606060",
    }),
    textContainer : new PIXI.Container,
    height : HEIGHT / 30,
    generateList : function(items) {
        this.textContainer.removeChildren();
        for(let i = 0; i < items.length; i++)
        {
            let currentItem = new PIXI.Text(items[i], this.style);
            currentItem.position.set( 20 + this.height, HEIGHT - 10 - ( (this.height / 2) + (currentItem.height / 2) ) - (i * 10) - (i * this.height));
            this.textContainer.addChildAt(currentItem, i);
        }
        
        let authorText = new PIXI.Text("Designed By Daniel Davies.", this.authorStyle);
        authorText.position.set( 10, 10 )
        this.textContainer.addChildAt(authorText, items.length);
    },
    init : function() {
        app.stage.addChild(this.textContainer);       
    }
}

let planetNameGenerator = {
    returnRandom : function (list) {
        result = list[ Math.floor( Math.random() * list.length ) ];
        return result;
    },
    usedNames : [],
    name : ["Ursula", "Rostom", "Demii", "Naomi", "Evee", "Mia", "Isla", "Lola", "Olivia", "Sophie", "Pippa", "Geogia", "Lucas", "Mila",
    "Josiah", "Austin", "Xavier", "Arabella", "Zeus", "Hera", "Posiden", "Demeter", "Ares", "Athena", "Apollo", "Artemis", "Hephaestus",
    "Aphrodite", "Hermes", "Dionysus", "Hades", "Hypnos", "Janus", "Nemesis", "Iris", "Hecate", "Tyche", "Daniel", "Christopher", "Caryn", "Mathilde", "Eros", "Ida", "Linus", "Kallipe", "Eugenia", "Eris", "Alpha", "Delta", "Bravo", "Gilese", "Kepler", "Ross", "Eridani", "Virginis", "Spe", "Arion", "Arkas", "Orbitar", "Taphao", "Dimidum", "Galileo", "Brahe", "Lipperhey", "Janssen", "Harriot", "Amateru", "Dagon", "Tadmor", "Meztli", "Smertrios", "Hypatia", "Quijote", "Dulcinea", "Rocinante", "Sancho", "Thestias", "Saffar", "Samh", "Majriti", "Fortitudo", "Draugr", "Poltergeist", "Phobetor", "Arber", "Tassili", "Madriu", "Naqaya", "Bocaprins", "YanYan", "Sissi", "Ganja", "Tondra", "Eburonia", "Drukyul", "Yvaga", "Naron", "Guarani", "Mastika", "Bendida", "Awasis", "Caleuche", "Wangshu", "Pipitea", "Ditso", "Asye", "Veles", "Finlay", "Onasilos", "Makropulos", "Surt", "Boinayel", "Eyeke", "Cayahuanca", "Abol", "Hiisi", "Belisama", "Mintome", "Neri", "Toge", "Iolaus", "Independance", "Ixbalanque", "Magor", "Fold", "Santamasa", "Noifasui", "Kavian","Babylonia", "Bran", "Alef", "Lete", "Chura", "Wadirum", "Buru", "Staburags", "Beirut", "Vytis", "Peitruss", "Trimobe", "Baiduri", "Cuptor", "Xolotl", "Hairu", "Bagan", "Laligurans", "Xolotlan", "Equiano", "Albmi", "Perwana", "Jebus", "Pollera", "Tumerarandu", "Haik", "Leklsullun", "Pirx", "Viriato", "Aumatex", "Negoiu", "Teberda", "Dopere", "Viculus", "Iztok", "Krotoa", "Halla", "Riosar", "Samagiya", "Isagel", "Eiger", "Ugarit", "Sazum", "Tanzanite", "Ping", "Agouto", "Ramajay", "Khomsa"
    ],
    numbers : [ "", "I","II","III","IV","V","VI","VII","VIII","IX","X", "XI", "XII", "XIII", "XIV", "XV"],
    identifier : function () {
        noNum = Math.floor(Math.random() * this.numbers.length);
        let result = "";
        if(noNum != 0)
        {
            result += " ";
        }
        result += this.numbers[noNum];   
        
        return result;
    },
    randomPlanetName : function(){
       let result = `${this.returnRandom(this.name)}${this.identifier()}`;
       while(this.usedNames.indexOf(result) != -1 ) //prevents same name displaying twice
       {
           console.log("duplicate name!")
           result = `${this.returnRandom(this.name)}${this.identifier()}`;
       }
       this.usedNames.push(result);
       return result;
    }
}

let bgCoordColor = [];
function addCoordColor(array, x, y, color) {
    array.push(x);
    array.push(y);
    array.push(color);
}

let orbitCoordColor = [];
function addOrbit(x, y, radius, color) {
    orbitCoordColor.push(x);
    orbitCoordColor.push(y);
    orbitCoordColor.push(radius);
    orbitCoordColor.push(color);
}

let planetCoordColor = [];
function addPlanet(x, y, radius, color) {
    planetCoordColor.push(x);
    planetCoordColor.push(y);
    planetCoordColor.push(radius);
    planetCoordColor.push(color);
}

//
//star drawing
//
function renderStar(array, x, y, color) {
    addCoordColor(array, x - 2, y, color);
    addCoordColor(array, x + 2, y, color);
    addCoordColor(array, x, y + 2, color);
    addCoordColor(array, x, y - 2, color)
}
starPlot = [];

function generateStars(distance) {
    starPlot = [0];
    let squareCounter = 0;

    for (let i = 0; i < WIDTH / SQUARE_SIZE; i++) {
        for (let j = 0; j < HEIGHT / SQUARE_SIZE; j++) {
            if (squareCounter % distance === 0) {
                starPlot.push(j + (Math.random() * distance) - (distance / 2));
                starPlot.push(i + (Math.random() * distance) - (distance / 2));
            }

            squareCounter++;
        }
    }
}

function renderStars(color) {
    for (let i = 0; i < starPlot.length; i += 2) {
        renderStar(bgCoordColor, starPlot[i], starPlot[i + 1], color);
    }
}

let systemEngine = {
    speed : 0.200,
    orbitCoords : [],
    noPlanets : 0,
    orbits : [], 
    orbitSpeeds : [],
    planetColors : [],
    orbitPos : [],
    planetSizes : [],
    planetNames : [],
    clear : function () {
       this.orbitCoords = [];
       this.noPlanets = 0;
       this.orbits = [];
       this.orbitSpeeds = [];
       this.planetColors = [];
       this.orbitPos = [];
       this.planetSizes = [];
       this.planetNames = [];
       orbitCoordColor = [];
       planetCoordColor = [];
    },
    generateSystem : function (){
        planetGraphics.forceClear();
        this.clear();
        
        while (this.noPlanets === 0) { //calculates number of planets
           this.noPlanets = Math.round(Math.random() * 7);
        }
        
        console.log(this.noPlanets);
        
        const minDistance = 17; // minimum distance between orbits
        
        for (let i = 0; i < this.noPlanets; i++) //determine orbit distances and planet sizes
        {
            let randomDistance = Math.round(Math.random() * 27);
            //let randomDistance = 27;
            if (this.orbits.length > 0) {
                this.orbits.push( minDistance + this.orbits[i - 1] + randomDistance);
            } 
            else {
                this.orbits.push(10 + minDistance + randomDistance);
            }
            
            let randomSize = Math.round(Math.random() * 5); //calculates random planet sizes
            this.planetSizes.push(3 + randomSize);
            
            this.orbitSpeeds.push(Math.sqrt((1 / this.orbits[i]) / 1000));
            this.orbitPos.push(Math.random());
            this.updateOrbits();
            
            this.planetColors.push(Math.random());
            this.planetNames.push(planetNameGenerator.randomPlanetName());
        }
        this.updateOrbits();
        textGraphics.generateList(systemEngine.planetNames);
        orbitGraphics.drawHollowCircles(orbitCoordColor); //orbits
        keyGraphics.drawkey( systemEngine.planetColors ); //key
    
        
    },
    updatePlanets : function () {
        planetCoordColor = [];
        addPlanet((WIDTH / 2), (HEIGHT / 2), 15 * SQUARE_SIZE, 0xffff00); //sun
        for (let i = 0; i < this.noPlanets; i++) //render planets and paths 
        {
            let orbitX = (WIDTH / 2) + SQUARE_SIZE * (this.orbits[i] * Math.cos((2 * Math.PI) * this.orbitPos[i]));
            let orbitY = (HEIGHT / 2) + SQUARE_SIZE * (this.orbits[i] * Math.sin((2 * Math.PI) * this.orbitPos[i]));
            addPlanet(orbitX, orbitY, this.planetSizes[i] * SQUARE_SIZE, rainbow(1, this.planetColors[i]));
        }
    },
    updateOrbits : function () {
       orbitCoordColor = [];
       for (let i = 0; i < this.orbits.length; i++)
       {
         addOrbit(WIDTH / 2, HEIGHT / 2, (this.orbits[i] * SQUARE_SIZE), 0xffffff);
       }
    },
    movePlanets : function (deltaTime){
        for (let i = 0; i < this.orbitSpeeds.length; i++) 
        {
            if (this.orbitPos[i] < 1) 
            {
                this.orbitPos[i] += (this.orbitSpeeds[i] * (this.speed / 5) * deltaTime);
            } 
            else 
            {
                this.orbitPos[i] = 0.00;
            }
        }
    }
    
}

var main = function () {
    
    //order here determines z index
    backgroundGraphics.init();
    orbitGraphics.init();
    planetGraphics.init();
    keyGraphics.init();
    textGraphics.init();

    var lastUpdate = Date.now();
    var myInterval = setInterval(onTick, 0);

    systemEngine.generateSystem();
    
    generateStars(1200); //larger number = less stars
    
    bgCoordColor = [];
    renderStars(0x858585);
    backgroundGraphics.drawSquares(bgCoordColor); //stars
    
    function onTick() {
        var now = Date.now();
        var dt = now - lastUpdate;
        lastUpdate = now;

        systemEngine.movePlanets(dt);
        systemEngine.updatePlanets();

        
        planetGraphics.drawFilledCircles(planetCoordColor); //planets

    }
}
