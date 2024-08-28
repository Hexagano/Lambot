import os
import re
import os.path
import string

for filename in os.listdir(os.curdir): 
    new_filename = filename.lstrip(string.digits)
    if new_filename != filename:
        if os.path.isdir(filename):
            print("Dir name not changed", filename, '->', new_filename)
        elif os.path.isfile(new_filename):
            print("File name in use, not renamed", filename, '->', new_filename)
        else:
            print ("Renaming %s to %s" % (filename, new_filename))
            os.rename(filename, new_filename)
           
 
print('Any filename starting with a digit has been renamed.')
