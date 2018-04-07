var movies = [];
var _userRating = [];
var _MovieRating = [];
var _moviesTitle;
var _table;
var showList = false;

var userSelection;
var userRating;
var _user;
var demoUser;
var _favMovies;

$(document).ready(()=>{
    $("#toggleCurrentMovies").click(toggleCurrentMovies);
    
    if($("#ratedMovies").children().length == 0){
        $("#recDiv").hide();
    }

    $("#regSection").on('submit', function(e){
        e.preventDefault();
        
        _user = {
            'id': "-1",
            'ratings': [],
            'total': 0,
            'username': $("#regUser").val(),
            'password': $("#regPass").val()
        };

        _favMovies = _user.ratings;

        $("#userMsg").text($("#regUser").val());
        hideElement($(this));
        showElement("#MovieRatingSection");
    });
    
    // showLoading();
    hideElement("#MovieRatingSection");
    hideElement("#ratings");

    setTimeout(()=>{
        fetchRanksList();
        fetchMoviesList();
        
        setTimeout(()=>{
            showElement("#regSection");
            // hideLoading();
            $("#findNewMovies").click(calculate);
        },500);
    }, 100);
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

        _moviesTitle = movies.map(r => r.title);

        $( "#acInput" ).autocomplete({
            source: _moviesTitle,
            minLength: 3,
            select: function(event, ui){
                console.log(event);
                
                if( alreadyFaved(ui.item.label) )
                    return;
                else{
                    _favMovies.push({
                        'title': ui.item.label,
                        'movieid': movies.find(m => m.title == ui.item.label).movieid,
                        'rating': 0
                    })
                }

                updateFavList();
            }
        });
    });
}

function updateFavList(){
    $("#ratedMovies").html('');

    for(var i=0; i<_favMovies.length;i++){
        $("#ratedMovies").append($('<div class="list-group-item">').html(`
            <span class="glyphicon glyphicon-minus" aria-hidden="true" onclick="removeMovie(${i})"></span>
            <span class="mlist"> <strong> ${_favMovies[i].title} </strong> </span> <div class="pull-right" id="rate_${_favMovies[i].movieid}"></div>
        `));

        counter = 0;
        $(`#rate_${_favMovies[i].movieid}`).html('');

        for (let j = 0; j < _favMovies[i].rating; j++) {
            var fullStar = `<span class="glyphicon glyphicon-star" aria-hidden="true" onclick="updateRate(${i},${j+1})"></span>`;
            $(`#rate_${_favMovies[i].movieid}`).append(fullStar);

            counter++;
        }

        for(let j=counter; j<5; j++){
            var emptyStar = `<span class="glyphicon glyphicon-star-empty" aria-hidden="true" onclick="updateRate(${i},${j+1})"></span>`;
            $(`#rate_${_favMovies[i].movieid}`).append(emptyStar);
        }
    }

    if($("#ratedMovies").children().length > 0){
        $("#recDiv").show();
    }else{
        $("#recDiv").hide();
    }
    calculate();
}

function removeMovie(id){
    _user.total -= parseFloat(_favMovies[id].rating);
    _favMovies.splice(id,1);

    updateFavList();
}

function updateRate(favID,rate){

    if(_favMovies[favID].rating == rate){
        _favMovies[favID].rating = 0;
        _user.total -= parseFloat(rate);
    }
    else{
        _user.total = parseFloat(_user.total) + parseFloat(rate) - parseFloat(_favMovies[favID].rating);
        _favMovies[favID].rating = rate;
    }

    updateFavList();
}

function alreadyFaved(title){
    for(var i = 0; i< _favMovies.length; i++)
        if(_favMovies[i].title == title)
            return true;

    return false;
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

    if(_favMovies.length < 5)
        return;

    var pearson = [];

    // _user.ratings = _favMovies;

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

    // console.log("selected user " + pearson[0].otherUser);

    // console.log(parseFloat(pearson[0].p));
    // if(parseFloat(pearson[0].p) <= 0)
    //     return;

    var mathcedUser = findUserByID(_userRating,pearson[0].otherUser);
    var DifList = findDifferentMovies(_user, mathcedUser).sort((a,b) => {
        return b.rating-a.rating;
    });

    console.log(DifList);

    $("#recMovies").html('');
    let len = DifList.length > 25 ? 25 : DifList.length;
    for(var i=0; i<len; i++)
        $("#recMovies").append($("<li>").html(`<span class="glyphicon glyphicon-plus" onclick="addFavMovieFromRec(${DifList[i].id})"></span> ${getMovieTitleById(DifList[i].id)}`));
}

function findDifferentMovies(user1,user2){
    var res = [];
    for(var i = 0; i < user2.ratings.length; i++){
        var user1Rate = userRatedMovie(user1,user2.ratings[i].movieid);
        if(user1Rate == -1)
            res.push({'id':user2.ratings[i].movieid,
                    'rating': user2.ratings[i].rating});
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

function addFavMovieFromRec(id){
    _favMovies.push({
        'title': movies.find(m => m.movieid == id).title,
        'movieid': id,
        'rating': 0
    });

    updateFavList();
}