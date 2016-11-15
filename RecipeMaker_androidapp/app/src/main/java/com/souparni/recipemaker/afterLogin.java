package com.souparni.recipemaker;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;

import java.util.ArrayList;

public class afterLogin extends AppCompatActivity {

    Button like_btn, dislike_btn;
    ImageView myImage;
    public int i = 0;
    int[] images = { R.drawable.applepieimage1, R.drawable.blueberrymuffins, R.drawable.friesimage1, R.drawable.idli_sambar, R.drawable.avacado_egg_rolls, R.drawable.paneer_kebabs, R.drawable.panipuriimage1, R.drawable.pastaimage1, R.drawable.pavbhajiimage1, R.drawable.pizzaimage2, R.drawable.sandwichimage1, R.drawable.sushiimg1, R.drawable.sweetpotatomacandcheeseimage1};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_after_login);

        like_btn = (Button) findViewById(R.id.btn_like);
        dislike_btn = (Button) findViewById(R.id.btn_dislike);
        myImage = (ImageView) findViewById(R.id.imageView);
        //Just set on Click listener for the image

        like_btn.setOnClickListener(iButtonChangeImageListener);
        dislike_btn.setOnClickListener(gButtonChangeImageListener);
       // myImage.setImageResource(images[0]);
    }

    View.OnClickListener iButtonChangeImageListener = new View.OnClickListener() {

        public void onClick(View v) {
            //Increase Counter to move to next Image. Here i is the current Image
            i++;
            i = i % images.length;
            myImage.setImageResource(images[i]);


        }
    };

    View.OnClickListener gButtonChangeImageListener = new View.OnClickListener() {

        public void onClick(View v) {
            //Increase Counter to move to next Image
            i++;
            i = (i + images.length) % images.length;

            myImage.setImageResource(images[i]);

        }
    };

}


