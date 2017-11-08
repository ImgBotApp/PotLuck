import json
from os import path


def array_append(val, obj):
    val['_id'] = val.pop('id')  # Rename key. Error raised if popped key is undefined.
    obj.append(recipe)  # Append to output JSON array.


def check_for_duplicates(val, obj):
    check = True
    for el in obj:
        if 'id' in val.keys() and '_id' in el and el['_id'] == val['id']:
            check = False
            return 1
    if check:
        array_append(val, obj)
        return 0


def dump(obj):
    with open('../../Files/Recipes/DupsRMed_OIDsSet/Rand_Food_Recipes_Out(' + str(len(obj)) + ').JSON', 'w',
              encoding='utf8') as outfile:
        json.dump(obj, outfile)


print('Looking in ' +
      path.abspath('../../Files/Recipes/Spoonacular_Raw') +
      ' for file.\n\nPlease enter the name of the file you want to convert: ')

inputfile = ''
while True:
    line = input()
    if line.rstrip().split('.')[-1] != 'JSON':
        print('Please enter a valid infile name (must end in .JSON): ')
    else:
        inputfile = path.abspath('../../Files/Recipes/Spoonacular_RAW') + '/' + line
        break

with open(inputfile, encoding='utf8') as json_file:  # Open input file
    data_wd = []  # Instantiate empty JSON array for our output
    data_rd = json.load(json_file)  # Load JSON
    duplicate_count = 0
    print('[Recipe List]\n')
    for idx, recipe in enumerate(data_rd):  # Iterate through rows
        print('Index in List:', idx, '\n\t|\n\t -- Title:', recipe['title'], '\n\t|\n\t -- ID: ' + str(recipe['id']),
              '\n')
        if not data_wd:  # Append first element of 'for in' in else statement won't work (this feels dumb)
            array_append(recipe, data_wd)
        else:
            duplicate_count += check_for_duplicates(recipe, data_wd)  # Check for duplicate elements
    print(str(duplicate_count))
    dump(data_wd)  # Dump to JSON file
