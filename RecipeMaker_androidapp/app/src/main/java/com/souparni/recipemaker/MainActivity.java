package com.souparni.recipemaker;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    Button login_btn;
    Button register_btn;
    Button password_btn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        login_btn = (Button)findViewById(R.id.btn_login);

        login_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                EditText login = (EditText)findViewById(R.id.txt_login);
                EditText password = (EditText)findViewById(R.id.txt_password);

                if(!login.getText().toString().trim().equals(null) && !password.getText().toString().trim().equals(null)) {
                    // Toast.makeText(MainActivity.this, "Successfully Registered! An email has been sent to you for confirmation.", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(MainActivity.this, afterLogin.class);
                    startActivity(intent);
                }
                else{
                     Toast.makeText(MainActivity.this, "Please fill all the fields correctly.", Toast.LENGTH_LONG).show();
                }
            }
        });

        password_btn = (Button)findViewById(R.id.btn_password);

        password_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, ForgotPassword.class);
                startActivity(intent);
            }
        });

        register_btn = (Button)findViewById(R.id.btn_register);

        register_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, Registration.class);
                startActivity(intent);
            }
        });
    }

}
