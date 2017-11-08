import json
from os import path


# Initialize what will be out concatenated JSON string result
jsonStrRes = ''

print('Looking in ' +
      path.abspath('../../Files/Recipes/Spoonacular_Raw') +
      ' for file.\n\nPlease enter the name of the file of JSON arrays: ')

inputfile = ''
while True:
    line = input()
    if line.rstrip().split('.')[-1] != 'JSON':
        print('Please enter a valid file name (must end in .JSON): ')
    else:
        inputfile = '../../Files/Recipes/Spoonacular_RAW' + '/' + line
        break

# Open raw recipe file generated from GetRandRecipe Java script
print('Opening file.')
with open(inputfile, 'r', encoding='utf8') as f:
    print('File opened. Concatenating JSON string arrays...')

    # State variable (first iteration check)
    firstIter = True

    # Iterate through each line until loop completes normally.
    for line in f:

        # Strip off carriage return before check
        line = line.rstrip()

        # If x is empty move on to next iteration in loop
        if not line: continue

        if firstIter:
            # Splice from first bracket of line to last curly brace in line
            jsonStrRes += line[:len(line) - 1] + ',\n'
            firstIter = False
        else:
            # Splice from first curly brace of line to last curly brace in line
            jsonStrRes += line[1:len(line) - 1] + ',\n'
    else:
        print('JSON string arrays concatenated. Converting to JSON object...')

        # Create final JSON object
        jsonRes = json.loads(jsonStrRes[:len(jsonStrRes.rstrip()) - 1] + ']')

        # Derive outfile name from original filename
        outfile = path.abspath(f.name + '/..') + '\\' + f.name.split('/')[-1].split('.')[0] + '_concat.JSON'

        print('Conversion finished. Writing to ' + outfile)

        # Write final JSON object to JSON file
        with open(outfile, 'w') as of:
            json.dump(jsonRes, of)
        print('Writing finished.')

