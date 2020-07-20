# Pennbook

## Backround

A mini Facebook application! Includes all features one would find in the original platform - profiles, comments, chats, pages, likes, reactions, friend recomendations and more. It is built using Node.js for the backend API and Angular.js for the frontend. This project was a winner at a Facebook sponsered competition at the University of Pennsylvania. 

## Frontend

The interface of the app closely resembles that of the Facebook platform. Here are sample images of the profile and chat components:
<img src="https://www.cis.upenn.edu/~nets212/img/2019-g39-1.png?raw=true"/>        

## Chat
The app also included a chat feature which was implemented using socket.io on the backend and allowed users to chat with thier friends in groups or 1 on 1!

<img src="https://www.cis.upenn.edu/~nets212/img/2019-g39-2.png?raw=true"/>

## Adsorption Algorithm & Map Reduce
The app also includes a friend recomendation system which is based on Baluja et al.'s ![Adsorption Algorithm] https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/34407.pdf and works in similar fashion to the google Page Rank algorithm. The implementation of this algorithm is done through the Apache Hadoop framework to allow for distributed processing so as to accomodate for large scale social media graph. 

## Scalability & Security

The app is built with the goal of being as scalable as possible. It can rapidly find the relevent feed for a given user through its database infrastructure, the scheme for which can be found in the backend. Furthermore, individual posts are loaded one by one in a lazy fashion so as to ensure that the user never feels like thier feed is slow to load. 

With regards to security the app is protected against XSS and injection attacks. Furthermore it is encrypted using SSL and communication with the backend server only succeeds with the use of a valid jwt token.

## Next Steps!

Feel free to fork the repo, play around with and/or contribute!
