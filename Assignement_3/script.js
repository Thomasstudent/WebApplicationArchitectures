let api_key = "1d49e977704f914434b3782cbc9ad065";
let base_url_image = "https://image.tmdb.org/t/p/w300";
var title_movies = [];
var compteur = 0;

function onSuccess(result) {
  return result.json();
}

function onError(error) {
  console.log("Error : " + error);
}

function populateDiv(result) {
  var first_div = document.createElement("div");
  first_div.style.display = "table";
  //Display the title
  var title = document.createElement("h2");
  title.innerHTML = result["results"][0]["original_title"];
  first_div.appendChild(title);
  title_movies.push(result["results"][0]["original_title"].toLowerCase());

  //Display the poster
  var img = document.createElement("img");
  img.src = "".concat(base_url_image, result["results"][0]["poster_path"]);
  first_div.appendChild(img);

  //Display the date
  var date = document.createElement("h4");
  var date_object = new Date(result["results"][0]["release_date"]);
  date.innerHTML = date_object.toLocaleDateString();
  first_div.appendChild(date);

  document.body.appendChild(first_div);
  //Get ID
  var id = result["results"][0]["id"];
  var url_credit = "".concat(
    "https://api.themoviedb.org/3/movie/",
    id,
    "/credits?api_key=",
    api_key
  );
  fetch(url_credit).then(onSuccess, onError).then(populateForm);
}

function populateForm(result) {
  //Get director(s) and actors with their id
  var directors = {};
  var actors = {};
  result["cast"].forEach(function (entry) {
    if (entry["known_for_department"] === "Acting") {
      actors[entry["id"]] = entry["name"].toLowerCase();
    }
  });
  result["crew"].forEach(function (entry) {
    if (entry["job"] === "Director") {
      directors[entry["id"]] = entry["name"].toLowerCase();
    }
  });

  //Display a div with a form
  var div_form = document.createElement("div");
  var form = document.createElement("form");
  //We create a input text field for the form
  var input_person = document.createElement("input");
  input_person.id = "input_person";
  input_person.setAttribute("type", "text");
  //We create a label for the input text field
  var input_person_label = document.createElement("label");
  input_person_label.htmlFor = "input_person";
  input_person_label.innerHTML =
    "Enter the name of an actor or a director of this movie : ";
  //We create a submit button for the form
  var button = document.createElement("input");
  button.setAttribute("type", "submit");
  button.setAttribute("value", "Submit");
  //We add all these elements to the form
  form.appendChild(input_person_label);
  form.appendChild(input_person);
  form.appendChild(button);
  //We add the form to the div and the div to the body
  div_form.appendChild(form);
  document.body.appendChild(div_form);
  //We add an event on the submit button of the form
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var user_input = input_person.value.toLowerCase();
    //We check if the answer of the user is correct
    if (
      Object.values(directors).includes(user_input) ||
      Object.values(actors).includes(user_input)
    ) {
      //If the answer is correct, we take the id of the person
      var key = Object.keys(actors).find((key) => actors[key] === user_input);
      if (key == null) {
        key = Object.keys(directors).find(
          (key) => directors[key] === user_input
        );
      }
      //We remove the form, so the user cannot answer anymore
      div_form.removeChild(form);
      //We display a message to congrate the user
      var info_message = document.getElementById("".concat("info", compteur));
      if (info_message == null) {
        var info_message = document.createElement("p");
        compteur = compteur + 1;
        info_message.id = "".concat("info", compteur);
        div_form.appendChild(info_message);
      }
      info_message.innerHTML = "You are right! Good job!";
      info_message.style.color = "green";
      //We perform another fetch to get the informations about the person
      var url_person = "".concat(
        "https://api.themoviedb.org/3/person/",
        key,
        "?api_key=",
        api_key
      );
      fetch(url_person).then(onSuccess, onError).then(populatePerson);
    } else {
      //If the answer is wrong, we display an error message
      var info_message = document.getElementById("".concat("info", compteur));
      if (info_message == null) {
        var info_message = document.createElement("p");
        compteur = compteur + 1;
        info_message.id = "".concat("info", compteur);
        div_form.appendChild(info_message);
      }
      info_message.innerHTML = " ".concat(
        input_person.value,
        " is not a director or an actor of this movie!"
      );
      info_message.style.color = "red";
    }
  });
}

function populatePerson(result) {
  var div_person = document.createElement("div");
  div_person.style.display = "table";
  //Display the name
  var name = document.createElement("h2");
  name.innerHTML = result["name"];
  //Display the poster
  var img = document.createElement("img");
  img.src = "".concat(base_url_image, result["profile_path"]);
  //Add these elements to the div and the div to the body
  div_person.appendChild(name);
  div_person.appendChild(img);
  document.body.appendChild(div_person);
  //We perform a fetch to get all the movies linked to this person
  url_all_movies = "".concat(
    "https://api.themoviedb.org/3/person/",
    result["id"],
    "/movie_credits?api_key=",
    api_key
  );
  fetch(url_all_movies).then(onSuccess, onError).then(populateFormMovie);
}

function populateFormMovie(result) {
  //Get all the movies
  var movies = [];
  result["cast"].forEach(function (entry) {
    movies.push(entry["title"].toLowerCase());
  });

  //Display a div with a form
  var div_form_movie = document.createElement("div");
  var form_movie = document.createElement("form");
  //We create an input text field for the form
  var input_movie = document.createElement("input");
  input_movie.id = "input_movie";
  input_movie.setAttribute("type", "text");
  //We create a label for the input text field
  var input_movie_label = document.createElement("label");
  input_movie_label.htmlFor = "input_movie";
  input_movie_label.innerHTML =
    "Enter the title of a movie linked to this person : ";
  //We create a submit button for the form
  var button = document.createElement("input");
  button.setAttribute("type", "submit");
  button.setAttribute("value", "Submit");
  //We add all these elements to the form
  form_movie.appendChild(input_movie_label);
  form_movie.appendChild(input_movie);
  form_movie.appendChild(button);
  //We add the form to the div and the div to the form
  div_form_movie.appendChild(form_movie);
  //We add an event on the submit button of the form
  document.body.appendChild(div_form_movie);
  form_movie.addEventListener("submit", function (event) {
    event.preventDefault();
    var user_input_movie = input_movie.value.toLowerCase();
    //We check if the answer of the user is correct
    if (movies.includes(user_input_movie)) {
      //We check if the movie has not already appeared in the game
      if (title_movies.includes(user_input_movie)) {
        //If the movie has already appeared, we display a warning message
        var warning_message = document.getElementById(
          "".concat("warning_message", compteur)
        );
        if (warning_message == null) {
          var warning_message = document.createElement("p");
          compteur = compteur + 1;
          warning_message.id = "".concat("warning_message", compteur);
          div_form_movie.appendChild(warning_message);
        }
        warning_message.innerHTML = " ".concat(
          "You are right but it seems that you already played with ",
          input_movie.value,
          "."
        );
        warning_message.style.color = "orange";
      } else {
        //If the answer is coorect, we display a congrate message
        var warning_message = document.getElementById(
          "".concat("warning_message", compteur)
        );
        if (warning_message == null) {
          var warning_message = document.createElement("p");
          compteur = compteur + 1;
          warning_message.id = "".concat("warning_message", compteur);
          div_form_movie.appendChild(warning_message);
        }
        warning_message.innerHTML = "Another great answer: Well Done!";
        warning_message.style.color = "green";
        //Then we display the movie as we already did
        var url_movie = "".concat(
          "https://api.themoviedb.org/3/search/movie?api_key=",
          api_key,
          "&query=",
          user_input_movie
        );
        fetch(url_movie).then(onSuccess, onError).then(populateDiv);
      }
    } else {
      //If the answer of the user is incorrect, we display a warning message
      var warning_message = document.getElementById(
        "".concat("warning_message", compteur)
      );
      if (warning_message == null) {
        var warning_message = document.createElement("p");
        compteur = compteur + 1;
        warning_message.id = "".concat("warning_message", compteur);
        div_form_movie.appendChild(warning_message);
      }
      warning_message.innerHTML = " ".concat(
        input_movie.value,
        " is not a movie linked to this person!"
      );
      warning_message.style.color = "red";
    }
  });
}

//First Movie
var url_movie = "".concat(
  "https://api.themoviedb.org/3/search/movie?api_key=",
  api_key,
  "&query=The Avengers"
);
fetch(url_movie).then(onSuccess, onError).then(populateDiv);
