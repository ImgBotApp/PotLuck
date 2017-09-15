import json

recipe_data = open('Rand_Food_Recipes_Out534 .JSON', 'r')
jsons = json.load(recipe_data)
#print json_arr
recipes = []
allIDs = []
for recipes in jsons:
    allIDs.append(recipes['_id'])
	
total = 0;
for titles in jsons:
    if (total<10):
        print titles['title']
        
    total += 1
    
allIngredients = [[]] * total

def ReplaceFracs(s):
    
    # This catches unicode fractions
    fractions = {
    0x2189: 0.0,  # ; ; 0 # No       VULGAR FRACTION ZERO THIRDS
    0x2152: 0.1,  # ; ; 1/10 # No       VULGAR FRACTION ONE TENTH
    0x2151: 0.11111111,  # ; ; 1/9 # No       VULGAR FRACTION ONE NINTH
    0x215B: 0.125,  # ; ; 1/8 # No       VULGAR FRACTION ONE EIGHTH
    0x2150: 0.14285714,  # ; ; 1/7 # No       VULGAR FRACTION ONE SEVENTH
    0x2159: 0.16666667,  # ; ; 1/6 # No       VULGAR FRACTION ONE SIXTH
    0x2155: 0.2,  # ; ; 1/5 # No       VULGAR FRACTION ONE FIFTH
    0x00BC: 0.25,  # ; ; 1/4 # No       VULGAR FRACTION ONE QUARTER
    0x2153: 0.33333333,  # ; ; 1/3 # No       VULGAR FRACTION ONE THIRD
    0x215C: 0.375,  # ; ; 3/8 # No       VULGAR FRACTION THREE EIGHTHS
    0x2156: 0.4,  # ; ; 2/5 # No       VULGAR FRACTION TWO FIFTHS
    0x00BD: 0.5,  # ; ; 1/2 # No       VULGAR FRACTION ONE HALF
    0x2157: 0.6,  # ; ; 3/5 # No       VULGAR FRACTION THREE FIFTHS
    0x215D: 0.625,  # ; ; 5/8 # No       VULGAR FRACTION FIVE EIGHTHS
    0x2154: 0.66666667,  # ; ; 2/3 # No       VULGAR FRACTION TWO THIRDS
    0x00BE: 0.75,  # ; ; 3/4 # No       VULGAR FRACTION THREE QUARTERS
    0x2158: 0.8,  # ; ; 4/5 # No       VULGAR FRACTION FOUR FIFTHS
    0x215A: 0.83333333,  # ; ; 5/6 # No       VULGAR FRACTION FIVE SIXTHS
    0x215E: 0.875,  # ; ; 7/8 # No       VULGAR FRACTION SEVEN EIGHTHS
    }

    rx = r'(?u)([+-])?(\d*)(%s)' % '|'.join(map(unichr, fractions))

    import re

    test = s
    for sign, d, f in re.findall(rx, test):
        sign = -1 if sign == '-' else 1
        d = int(d) if d else 0
        number = sign * (d + fractions[ord(f)])
        test = test.replace(f,u"")
        
    
   
    
    # this removes all digits from out ingredients
    test = test.translate({ord(k): None for k in string.digits})
    
    return test

import string
def ingList(i):
    clean_ings = []
    allIngredients[i] = []
    
    #print "null"
    for key in jsons[i]['extendedIngredients']:
        
        key = ReplaceFracs(key['originalString'])
        print key
        key = key.translate({ord(k) : None for k in string.punctuation})
        s = key.encode('utf8')
        words = s.split()
        
        for word in words:
            clean_ings.append(word)
            allIngredients[i].append(word)
    return clean_ings

	
allIDsWithTitles = {};
def addAllDocs():
    i = 0
    allRec = []
    
    while(i<total):
        
        allRec.append([jsons[i]["title"],ingList(i)])
        allIDsWithTitles[jsons[i]["title"]] = allIDs[i]
        i = i+1
    return allRec

recs = addAllDocs()

def docLen(doc):
    
    length = 0
    counted = set([])
    
    for word in doc:
        if word not in counted:
            num = doc.count(word)
            length += num**2
            counted.add(word)
    
    return length**0.5

def compare(my_set1, my_set2,sim):
    
    my_finalDoc = []
    count = 0

    # Soup's method - computes the cosine similarty
    # this part computes the dot product
    for word in my_set1:
        #print(word)
        for other_words in my_set2:
            #print(other_words)
            if(word == other_words):
                my_finalDoc.append(word)
                count = count + 1
    
    #cos_similarity = len(my_finalDoc)/((len(my_set2)**0.5) * (len(my_set1) ** 0.5))
    # Because my_set1 and my_set2 are not binary term vectors (they can contain multiple entries of the same word)
    # Their lengths need to be computed a little differently. See method above.
    
    cos_similarity = len(my_finalDoc)/((docLen(my_set2)) * (docLen(my_set1)))
    
    # computing jaccard similarity, see the notes on slack!
    # uses binary term vectors
    my_set1 = set(my_set1)
    my_set2 = set(my_set2)
    
    # transforming the lists to sets means no duplicate words
    intersection = my_set1 & my_set2
    union = my_set1 | my_set2
    
    jacc_similarity = len(intersection)/len(union)

    
    if(jacc_similarity > sim or cos_similarity > sim):
        
        return True
    
    return False

def split():
    addAllDocs()
    one = []
    two = []
    for i in range(len(my_list)):
        for j in range(i + 1, len(my_list)):
            set_1 = my_list[i]
            set_2 = my_list[j]
            for k in set_1:
                one.extend(k.split(' '))
            for l in set_2:
                two.extend(l.split(' '))
            compare(one, two)
    return

recSims = []

# this number is our similarity threshold!  Mess around with it!
sim = 0.95
for i in range(0,total-1):
    tempSim = []
    for j in range(i+1,total-1):
        
        if compare(recs[i][1],recs[j][1],sim):
            
            # watch out for duplicates
            if recs[i][0] != recs[j][0]:
                print recs[i][0], ' is similar to ', recs[j][0]
                
                tempSim.append(recs[j][0])
                
            
    recSims.append(tempSim)
    
recipeDict = {}

for rec in allIngredients:
    rec = set(rec)
    for word in rec:
        
        if (recipeDict.has_key(word)):
            recipeDict[word] += 1
        else:
            recipeDict[word] = 1

max_word = 0
mostFreq = ""
for word in recipeDict:
    
    if (recipeDict[word]>max_word):
        mostFreq = word;
        max_word = recipeDict[word]
    
print mostFreq,max_word

tf = [{}] * total
count = 0
for rec in allIngredients:
    tf[count] = {}
    
    # get term frequency
    for word in rec:
         
       
        if (tf[count].has_key(word)):
            tf[count][word] += 1
        else:
            tf[count][word] = 1
            
    # scale term frequency by idf
    for word in tf[count]:
        tf[count][word] = float(tf[count][word]*total/recipeDict[word])
    count += 1
    
import math

def cos_sim(rec1,rec2,sim):
    
    terms1 = rec1.keys()
    terms2 = rec2.keys()
    
    intersection = set(terms1) & set(terms2)
    
    dot_prod = 0
    
    for word in intersection:
        dot_prod += rec1[word]*rec2[word]
        
    length1 = 0
    for word in rec1:
        length1 += rec1[word]**2
    length1 = math.sqrt(length1)
    
    length2 = 0
    for word in rec2:
        length2 += rec2[word]**2
    length2 = math.sqrt(length2) 
    
    # calc cosine similarity
    similarity = dot_prod/(length1*length2)
    
    if (similarity > sim):
        return True
    else:
        return False
    

def cos_sim_spec(rec1,rec2):
    
    terms1 = rec1.keys()
    terms2 = rec2.keys()
    
    intersection = set(terms1) & set(terms2)

    #print intersection
    dot_prod = 0
    
    for word in intersection:
        dot_prod += rec1[word]*rec2[word] 
   
   # print dot_prod
    length1 = 0
    for word in rec1:
        length1 += rec1[word]**2
    length1 = math.sqrt(length1)
    
    
    length2 = 0
    for word in rec2:
        length2 += rec2[word]**2
    length2 = math.sqrt(length2) 
   
    # calc cosine similarity
    return dot_prod/(length1*length2)  

cos_sim_spec(tf[1],tf[15])

import heapq as hq
max_sim = 0.0

similar_recs = [[] for _ in range(total)]

count = 0

new_sims = []
terms1 = []
terms2 = []
for i in range(0,total):
   
    for j in range(i+1,total):
        count = count + 1
        terms1.append(tf[i])
        terms2.append(tf[j])
        temp_sim = cos_sim_spec(tf[i],tf[j])
        
        if (temp_sim<0.5):
            max_sim = max(max_sim,temp_sim)
        
        new_sims.append(temp_sim)
        hq.heappush(similar_recs[i],(-1*temp_sim,j))
        hq.heappush(similar_recs[j],(-1*temp_sim,i))

from collections import defaultdict
sim_rec_ids = [{} for _ in range(total)]

#print terms1
#print terms2

print max_sim
for i in range(0,total):
    
    seen = set([])
    sim_rec_ids[i]["similarities"] = [{} for _ in range(90)]
    
    for j in range(0,90):
        
        
        key = allIDsWithTitles[recs[i][0]]
        
        sim_rec_ids[i]["id"] = key;
        
        check = True
        while ( check ):
            
            pop = hq.heappop(similar_recs[i])
            tmp = pop[1]
            val = allIDsWithTitles[recs[tmp][0]]
            
            if not val in seen and not key == val:
                check = False
            
        seen.add(val)
        
        
        
        sim_rec_ids[i]["similarities"][j]["id"] = str(val)
        sim_rec_ids[i]["similarities"][j]["sim"] = -1*pop[0]
        
    
with open('Aug_sims_test-534.json','w') as fp:
    json.dump(sim_rec_ids,fp)
    

print "finished dump"

#transfering to MongoDB through PyMongo

#Add code to automatically transfer files to mongo
import pymongo
import json
import urllib
import os
#Create a MongoClient to the running mongod instance

username = urllib.quote_plus(os.environ.get('MONGODB_PotLuck_USERNAME'))
print username

password = urllib.quote_plus(os.environ.get('MONGODB_POTLUCK_PASSWORD'))
print password

from pymongo import MongoClient
connection = pymongo.MongoClient("mongodb://%s:%s@162.243.2.42/PotLuck" % (username, password)) #establishes a connection to the database
db = connection.PotLuck  #? Handle to the book database
record1 = db.book_collection #Record1 indicates collection of records

page = open("Aug_sims_test-534.json", 'r')

parsed = json.loads(page.read())  #this contains the file in json format

#inserting the document into Mongo

for item in parsed:
    record1.insert_one(item)
    
print "done"

