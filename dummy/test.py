import requests

url = "https://openai80.p.rapidapi.com/images/generations"

prompt = input("Enter a prompt: ")

payload = {
	"prompt": prompt,
	"n": 1,
	"size": "1024x1024"
}
headers = {
	"content-type": "application/json",
	# "X-RapidAPI-Key": "9609f03343msh6c6f56ddd2968c3p1b746ajsn182e75ab4a26",
	"X-RapidAPI-Key": "0afdd413fdmshf25184bf368188fp11f955jsnb13751e084a0",
	"X-RapidAPI-Host": "openai80.p.rapidapi.com"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())