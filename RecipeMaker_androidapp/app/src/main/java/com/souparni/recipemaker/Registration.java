package com.souparni.recipemaker;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class Registration extends AppCompatActivity {

    Button btn_registration;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        btn_registration = (Button)findViewById(R.id.btn_registered);

        btn_registration.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                EditText password_init = (EditText)findViewById(R.id.Password1);
                EditText password_final = (EditText)findViewById(R.id.PasswordCheck);

                if(password_init.getText().toString().trim().equals(password_final.getText().toString().trim())) {
                    Toast.makeText(Registration.this, "Successfully Registered! An email has been sent to you for confirmation.", Toast.LENGTH_LONG).show();

                    Intent intent = new Intent(Registration.this, afterLogin.class);
                    startActivity(intent);
                }

                else{
                    Toast.makeText(Registration.this, "The passwords do not match.", Toast.LENGTH_LONG).show();
                }
            }
        });
    }
}
