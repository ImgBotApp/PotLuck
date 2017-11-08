package package1;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;


/**
 * Authored by Omar Taylor on 10/4/2016.
 */
public class GetRandRecipe {
    private int rCallMAx = 100; // Max recipes per API call
    private int rGetPerThread; // Recipes to retrieve per thread (Based on available processors for speed and I/O blocking optimization)
    private Thread[] tList; // List of threads
    private int rAmount; // Total amount of recipes to be collected

    private FileWriter fw = null;

    private GetRandRecipe(int amount) {
        this.rAmount = amount;
        int threadCnt = Runtime.getRuntime().availableProcessors();

        // Use only a single thread if less if less than rCallMax
        if (amount < rCallMAx) {
            this.rGetPerThread = rCallMAx; // Total to get / number of threads
            this.tList = new Thread[1];
        } else {
            this.rGetPerThread = rAmount / threadCnt;
            this.tList = new Thread[(double) rGetPerThread / rCallMAx == Math.floor((double) rAmount / rCallMAx / threadCnt) ? threadCnt : threadCnt + 1];
        }
        String fileOutName = "Rand_Food_Recipes_Out(" + rAmount + ").JSON";

        try {
            fw = new FileWriter(fileOutName, true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void spawnThreads() {
        System.out.println("Getting " + rAmount + " recipes - Sending Http GET request");

        for (int i = 0, amount = rAmount; i < tList.length || amount > 0; i++, amount -= (amount < rGetPerThread ? amount : rGetPerThread)) {
          tList[i] = new Thread(new RecipeAggregator(Math.min(rGetPerThread, amount), "Thread-" + (i + 1)));
            tList[i].start();
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("Enter the amount of random recipes you would like to retrieve:\n");
        Scanner sc = new Scanner(System.in);
        int nRecipes = sc.nextInt();
        while (nRecipes < 1) {
            System.out.println("Please enter a number higher than 1:\n");
            nRecipes = sc.nextInt();
        }

        long startTime = System.nanoTime();

        GetRandRecipe grr = new GetRandRecipe(nRecipes);

        System.out.println("Spawning " + grr.tList.length + " threads for the job.\n");

        sc.close();

        grr.spawnThreads();

        for (int i = 0; i < grr.tList.length; i++) {
            try {
                grr.tList[i].join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        grr.fw.close();

        long totalTimeSecs = ((System.nanoTime() - startTime) / 1000000000); // Seconds
        long totalTimeMins = totalTimeSecs / 60; // minutes

        System.out.println("\n" + grr.rAmount + " recipes collected in " + totalTimeMins + " min(s) and " + totalTimeSecs + " second(1) with " + grr.tList.length + " thread(s).");
    }

    class RecipeAggregator implements Runnable {
        private String threadName;
        private int recipesToGet;// Max API rGetPerThread per thread

        private RecipeAggregator(int recipesToGet, String tName) {
            this.recipesToGet = recipesToGet;
            this.threadName = tName;
        }

        @Override
        public void run() {
            while (recipesToGet > 0) {
                int toGet = (recipesToGet > rCallMAx ? rCallMAx : recipesToGet);
                String url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?limitLicense=true&number=" + toGet;

                URL obj;
                HttpURLConnection con;
                BufferedReader in;
                int responseCode = 0;
                try {
                    obj = new URL(url);
                    con = (HttpURLConnection) obj.openConnection();

                    // optional... default is GET
                    con.setRequestMethod("GET");

                    // add request header
                    con.setRequestProperty("X-Mashape-Key", "KwOFn4pzT3msh4h4uKF2urrQKdGBp1m6U6Hjsnz7V2U74DzSkQ");
                    con.setRequestProperty("Accept", "application/json");

                    while (responseCode != 200)
                        responseCode = con.getResponseCode();

                    System.out.println("\n" + threadName + " sending 'GET' request to URL: " + url + " with response code: " + responseCode);

                    in = new BufferedReader(new InputStreamReader(con.getInputStream()));

                    synchronized (fw) {
                        String inputLine;
                        while ((inputLine = in.readLine()) != null) {
                            inputLine = inputLine.substring(11, inputLine.length() - 1);

                            fw.write(inputLine + "\n");
                        }
                    }
                    in.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                recipesToGet -= toGet;
            }

            System.out.println(threadName + " finished.");
        }
    }
}
