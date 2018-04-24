Hi and thank you for choosing our movies recommendation system!

============================

Intro -
Instead of loading the web-system localy, you can use our server and save some CPU time - 
	---> http://movierecommender.epizy.com <---

If you still going to load it localy, please use Edge browser because Chrome & Firefox are blocking csv files loading without back-end server so it will not work properly.

P.S - we're highly recommended you to try our link above.

============================

Usage -
1. Select at least 5 movies from the search bar
2. Rate each movie 0-5 stars
3. Get a list of recommended movies 
4. Add/remove movies to your watched list from the recommended list or the search bar
    4.1. “+” button to add a movie from the recommended list to watched list
    4.2. “-“ button to remove a movie from the watched list
5. Watch a movie or two - fun is guaranteed!

============================

Algorithm -
Basic item-item collaborative filtering:
    - Calculate correlation between the new user and the existing users (user must rate at least 5 movies) 
    - Sort and pick top 30 similar users
    - Predict the rate that the new user will give to each unseen movie
    - Sort and recommend top predicted-rate

============================

Database - 
Used database from MovieLens (https://grouplens.org/datasets/movielens)
165K Movies ; 670 Users ; 100K Ratings

This site is brought you by Nadav Grinberg, Assaf Nahum, Inbar Rozenblum & Guy Zaks
2018, PW course, SISE, BGU