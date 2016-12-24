/**
 * Created by Souparni on 11/3/2016.
 */

var imgArray = new Array();

imgArray[0] = new Image();
imgArray[0].src = 'pastaimage1.jpg';

imgArray[1] = new Image();
imgArray[1].src = 'pizzaimage2.jpg';

imgArray[2] = new Image();
imgArray[2].src = 'friesimage1.jpg';

imgArray[3] = new Image();
imgArray[3].src = 'blueberrymuffins.jpg';

imgArray[4] = new Image();
imgArray[4].src = 'applepieimage1.jpg';

imgArray[5] = new Image();
imgArray[5].src = 'paneer_kebabs.jpg';

imgArray[6] = new Image();
imgArray[6].src = 'AvocadoEggrollsimage1.jpg';

imgArray[7] = new Image();
imgArray[7].src = 'sweetpotatomacand cheeseimage1.jpg';

imgArray[8] = new Image();
imgArray[8].src = 'sandwichimage1.jpg';

imgArray[9] = new Image();
imgArray[9].src = 'sushiimg1.jpg';

imgArray[10] = new Image();
imgArray[10].src = 'panipuriimage1.jpg';

imgArray[11] = new Image();
imgArray[11].src = 'pavbhajiimage1.jpg';

imgArray[12] = new Image();
imgArray[12].src = 'Idli_Sambar.jpg';
/* ... more images ... */

/*imgArray[5] = new Image();
imgArray[5].src = 'images/img/Splash_image6.jpg';*/

/*------------------------------------*/

function nextImage(element)
{
    var img = document.getElementById(element);

    for(var i = 0; i < imgArray.length;i++)
    {
        if(imgArray[i].src == img.src) // << check this
        {
            if(i === imgArray.length){
                document.getElementById(element).src = imgArray[0].src;
                break;
            }
            document.getElementById(element).src = imgArray[i+1].src;
            break;

        }
    }
}

function btntest_onclick()
{
    window.location.href = "RecommendationPage.html";
}

/*function startImage(){

    document.getElementById("pic").setAttribute("src", imgArray[0].src);
}   */