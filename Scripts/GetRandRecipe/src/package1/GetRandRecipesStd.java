package package1;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Scanner;

/**
 * Authored by O on 10/4/2016.
 */
public class GetRandRecipesStd {
    private int amount;
    private final String warning_message0 = "Please enter a number higher than 1: ";
    private boolean overwriteConfirm;

    public static void main(String[] args) throws IOException {
        GetRandRecipesStd grrs = new GetRandRecipesStd();
        System.out.println("Enter the amount of random recipes you would like to retrieve (Limit 100): ");
        Scanner sc = new Scanner(System.in);
        grrs.amount = sc.nextInt();
        while (grrs.amount < 1) {
            System.out.println(grrs.warning_message0);
            grrs.amount = sc.nextInt();
        }

        System.out.println("Getting " + grrs.amount + " recipes - Sending Http GET request");
        grrs.sendGet();
        sc.close();
    }

    // HTTP GET request
    private void sendGet() throws IOException {
        int file_amount = amount;

        PrintWriter response = null;
        while (amount > 0) {
            String fileOutName = "Rand_Food_Recipes_Out(" + file_amount + ").JSON";
            String url;
            url = amount > 100 ? "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?limitLicense=true&number=" + 100 % amount : "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?limitLicense=true&number=" + amount;

            URL obj = new URL(url);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();

            // optional... default is GET
            con.setRequestMethod("GET");

            // add request header
            con.setRequestProperty("X-Mashape-Key", "KwOFn4pzT3msh4h4uKF2urrQKdGBp1m6U6Hjsnz7V2U74DzSkQ");
            con.setRequestProperty("Accept", "application/json");

            int responseCode = con.getResponseCode();
            System.out.println("\nSending 'GET' request to URL: " + url);
            System.out.println("Response Code: " + responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;

            // Already initialized?
            if (response == null) response = new PrintWriter(fileOutName, "UTF-8");


            while ((inputLine = in.readLine()) != null) {
                inputLine = inputLine.substring(11, inputLine.length() - 1);
                response.println(inputLine);
            }
            in.close();
            amount -= amount > 100 ? 100 : amount;
        }
        if (response != null) {
            response.close();
        }


        System.out.println("Finished.");
    }


}
