var movies = [];
var _userRating = [];
var _MovieRating = [];
var _table;
var showList = false;

var userSelection;
var userRating;
var _user;
var demoUser;

$(document).ready(()=>{
    // hideElement("#table");
    $("#toggleCurrentMovies").click(toggleCurrentMovies);
       
    showLoading();
    hideElement("#ratings");

    fetchRanksList(updateUserSelection);
    fetchMoviesList(updateTable);

    setTimeout(()=>{
        hideLoading();
        $("#findNewMovies").click(calculate);
    },500);
});

function hideElement(elem){
    $(elem).hide();
}

function showElement(elem){
    $(elem).show();
}

function updateTable(){

    let _table = $("#tableBody");
    _table.html('');    


    for(var i=0; i< 50; i++)
    _table.append($("<tr>").html(`
        <td> ${movies[i].movieid} </td>
        <td> ${movies[i].title} </td>
        <td> ${movies[i].genres} </td>
    `));

    showElement("table");    
}

function updateUserSelection(){
    userSelection = $("#userSelection");
    
    userSelection.html('');
    userSelection.append($(`<option value=''></option>`));

    for (let i = 0; i < _userRating.length; i++)
        userSelection.append($(`<option value='${_userRating[i].id}'> Userid - ${_userRating[i].id} </option>`));
    
}

function selectUser(){
    var user = parseInt(userSelection.val());
    
    userRating = $("#userRating");

    userRating.html('');

    _user = findUserByID(_userRating,user);
    var userRate = _user.ratings;

    if(userRate == undefined)
        return;

    for(var i=0; i<userRate.length; i++)
        userRating.append($("<li>").text(`${getMovieTitleById(userRate[i].movieid)} - ${userRate[i].rating}`));

    showElement("#ratings");
    
}

function getMovieTitleById(id){
    for(var i=0; i < movies.length; i++)
        if(movies[i].movieid == id)
            return movies[i].title;
    
    return id;
}

function fetchMoviesList(callback){
    movies = [];

    $.get('data/movies.csv', function(_data){

        var data = _data.split('\n');
        for (let i = 1; i < data.length - 1; i++) {
            var movie = data[i].split(",");

            if(movie.length == 0)
                continue;
            
            let lastComma = movie.length-1;
            let id = movie[0];
            let genres = movie[lastComma].split('|');
            
            let _title = "";
            for (let j = 1; j < lastComma; j++) {
                _title += movie[j];
            }

            let title = _title;

            movies.push({
                'movieid': id,
                'title': title,
                'genres': genres
            });        
        }

        if(showList)
            callback();
    });
}

function fetchRanksList(callback){
    _userRating = [];
    _MovieRating = [];

    $.get('data/ratings.csv', function(_data){

        var data = _data.split('\n');
        for (let i = 1; i < data.length - 1; i++) {
            var rate = data[i].split(",");

            if(rate.length == 0)
                continue;
            
            let userID = rate[0];
            let movieID = rate[1];
            let rating = rate[2];
            let date = rate[3];

            addNewUserRate(userID,movieID,rating,date);
            addNewMovieRate(userID,movieID,rating,date);
        }

        if(callback)
            callback();
    });
}

function addNewMovieRate(userID,movieID,rating,date){
    var movie = indexOfMovie(_MovieRating,movieID);

    //update rating
    if(movie != -1){
        var list = _MovieRating[movie].ratings;

        var userIdx = findUserByID(list,userID);
        if(userIdx > -1){
            list[userIdx].rating = rating;
            list[userIdx].date = date;
        }else{
            list.push({
                'id': userID,
                'rating': rating,
                'date': date 
            });
        }

        _MovieRating[movie].total = parseFloat( _MovieRating[movie].total) + parseFloat(rating);
    }else{ //add new movie
        _MovieRating.push({
            'movieid': movieID,
            'ratings': [{
                'id': userID,
                'rating': rating,
                'date': date
            }],
            'total': parseFloat(rating)
        });
    }
}

function addNewUserRate(userID,movieID,rating,date){
    var user = findUserByID(_userRating,userID);

    //update rating
    if(user != -1){
        var list = user.ratings;

        var movieIdx = indexOfMovie(list,movieID);
        if(movieIdx > -1){
            list[movieIdx].rating = rating;
            list[movieIdx].date = date;
        }else{
            list.push({
                'movieid': movieID,
                'rating': rating,
                'date': date 
            });
        }
        user.total = parseFloat(user.total) + parseFloat(rating);        
    }else{ //add new user
        _userRating.push({
            'id': userID,
            'ratings': [{
                'movieid': movieID,
                'rating': rating,
                'date': date
            }],
            'total': parseFloat(rating)
        });
    }
}

function indexOfMovie(list,movieid){
    for(var i = 0; i < list.length; i++)
        if(list[i].movieid == movieid)
        return i;

    return -1;
}

function findUserByID(list,_id){
    for(var i = 0; i < list.length; i++)
        if(list[i].id == _id)
            return list[i];

    return -1;
}

function showLoading(){
    $(".lds-ripple").show();
}

function hideLoading(){
    $(".lds-ripple").hide();
}

function toggleCurrentMovies(){
    $("#userRating").toggle('slide');
}

function calculate(){
    var pearson = [];

    for(var i=0; i< _userRating.length;i++){

        demoUser = _userRating[i];

        if(demoUser.id == _user.id)
            continue;
        
        var mutualMovies = findMutualMovies(_user,demoUser);
        
        var currentUserRatings = mutualMovies.map(r=>{
            return parseFloat(r.currentUser);
        });
        
        var demoUserRatings = mutualMovies.map(r=>{
            return parseFloat(r.otherUser);
        });
        
        // console.log(mutualMovies);
        // console.log(currentUserRatings);
        // console.log(demoUserRatings);
        
        var p = spearson.correlation.pearson(currentUserRatings, demoUserRatings);

        p = isNaN(p) ? 0 : p;
        pearson.push({
            'p': p,
            'otherUser': demoUser.id
        });
    }

    pearson = pearson.sort((a,b) =>{return b.p-a.p;});
    console.log(pearson);

    console.log("selected user " + pearson[0].otherUser);

    var mathcedUser = findUserByID(_userRating,pearson[0].otherUser);
    var DifList = findDifferentMovies(_user, mathcedUser);

    console.log(DifList);

    $("#recMovies").html('');
    for(var i=0; i<DifList.length; i++)
        $("#recMovies").append($("<li>").text(`${getMovieTitleById(DifList[i])}`));
}

function findDifferentMovies(user1,user2){
    var res = [];
    for(var i = 0; i < user2.ratings.length; i++){
        var user1Rate = userRatedMovie(user1,user2.ratings[i].movieid);
        if(user1Rate == -1)
            res.push(user2.ratings[i].movieid);
    }

    return res;
}

function findMutualMovies(user1,user2){
    var res = [];
    for(var i = 0; i < user1.ratings.length; i++){
        var user2Rate = userRatedMovie(user2,user1.ratings[i].movieid);
        if(user2Rate != -1){
            res.push({
                'movieid': user1.ratings[i].movieid,
                'currentUser': user1.ratings[i].rating,
                'otherUser': user2Rate
            });
        }
    }

    return res;
}

function userRatedMovie(user,movieid){
    for(var i = 0; i < user.ratings.length; i++){
        if(user.ratings[i].movieid == movieid)
            return user.ratings[i].rating;
    }

    return -1;
}