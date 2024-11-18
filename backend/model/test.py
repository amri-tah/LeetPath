# #
# #
# #      Upload File
# #
# #

# import requests

# url = 'http://127.0.0.1:5000/upload'
# file_path = 'data.png'

# with open(file_path, 'rb') as file:
#     files = {'file': file}
#     response = requests.post(url, files=files)

# print(response.json())



# #
# #
# #      Rename File
# #
# #

# import requests

# url = 'http://127.0.0.1:5000/rename'
# data = {
#     'old_name': 'data.png',
#     'new_name': 'image.png'
# }

# response = requests.post(url, json=data)
# print(response.json())


# #
# #
# #      Download File
# #
# #

# import requests
# import os

# url = 'http://127.0.0.1:5000/download'
# data = {'filename': 'image.png'}

# response = requests.post(url, json=data)

# if response.status_code == 200:
#     content_disposition = response.headers.get('Content-Disposition')
#     if content_disposition:
#         filename = content_disposition.split('filename=')[-1].strip('"')
#     else:
#         filename = data['filename']

#     filename = os.path.basename(filename)

#     with open(filename, 'wb') as f:
#         f.write(response.content)
#     print(f'File "{filename}" downloaded successfully.')
# else:
#     print(f"Error: {response.json().get('error')}")


# #
# #
# #      Delete File
# #
# #


# import requests

# url = 'http://127.0.0.1:5000/delete'
# params = {'filename': 'image.png'}

# response = requests.delete(url, params=params)
# print(response.json())
