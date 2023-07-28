import $ from "jquery";

class Search {
  // 1. describe/create/initiate the object
  constructor() {
    this.addSearchHTML();
    this.resultsDiv = $("#search-overlay__result");
    this.openButton = $(".js-search-trigger");
    this.closeButton = $(".search-overlay__close");
    this.searchOverlay = $(".search-overlay");
    this.searchField = $("#search-term");
    this.events();
    this.isOverLayOpen = false;
    this.isSpinnerVisible = false;
    this.previousValue;
    this.typingTimer;
  }

  //  2. events
  events() {
    this.openButton.on("click", this.openOverlay.bind(this));
    this.closeButton.on("click", this.closeOverlay.bind(this));
    $(document).on("keydown", this.keyPressDispatcher.bind(this));
    this.searchField.on("keyup", this.typingLogic.bind(this));
  }

  // 3. methods (funtion, action...)
  typingLogic() {
    // to don't load the spinner if the arrow keys are pressed
    if (this.searchField.val() != this.previousValue) {
      clearTimeout(this.typingTimer);
      if (this.searchField.val()) {
        if (!this.isSpinnerVisible) {
          this.resultsDiv.html('<div class="spinner-loader"></div>');
          this.isSpinnerVisible = true;
        }
        this.typingTimer = setTimeout(this.getResults.bind(this), 750);
      } else {
        this.resultsDiv.html("");
        this.isSpinnerVisible = false;
      }
    }
    this.previousValue = this.searchField.val();
  }

  getResults() {
    $.getJSON(
      `${
        university_data.root_url
      }/wp-json/university/v1/search?term=${this.searchField.val()}`,
      (results) => {
        this.resultsDiv.html(`
      <div class="row">
        <div class="one-third">
          <h2 class="search-overlay__section-title">General Information</h2>
          ${
            results.generalInfo.length
              ? `<ul class="link-list min-list">`
              : "<p>Nothing found</p>"
          }
            ${results.generalInfo
              .map(
                (item) =>
                  `<li><a href="${item.permalink}">${item.title}</a> ${
                    item.postType == "post" ? `by: ${item.authorName}` : ""
                  }</li>`
              )
              .join("")}
          ${results.generalInfo.length ? `</ul>` : ""}
        </div>
        <div class="one-third">
          <h2 class="search-overlay__section-title">Programs</h2>
          ${
            results.programs.length
              ? `<ul class="link-list min-list">`
              : `<p>No programs match that search. <a href="${university_data.root_url}/programs">View All Programs</a></p>`
          }
            ${results.programs
              .map(
                (item) =>
                  `<li><a href="${item.permalink}">${item.title}</a></li>`
              )
              .join("")}
          ${results.programs.length ? `</ul>` : ""}
          <h2 class="search-overlay__section-title">Professors</h2>
          ${
            results.professors.length
              ? `<ul class="professor-cars">`
              : `<p>No professors match that search.</p>`
          }
            ${results.professors
              .map(
                (item) =>
                  `
                    <li class="professor-card__list-item">
                    <a class="professor-card" href="${item.permalink}">
                        <img class="professor-card__image" src="${item.image}">
                        <span class="professor-card__name">${item.title}</span>
                    </a>
                </li>
                  `
              )
              .join("")}
          ${results.professors.length ? `</ul>` : ""}
        </div>
        <div class="one-third">
          <h2 class="search-overlay__section-title">Events</h2>
          ${
            results.events.length
              ? ``
              : `<p>No events match that search. <a href="${university_data.root_url}/events">View All events</a></p>`
          }
            ${results.events
              .map(
                (item) =>
                  `
                    <div class="event-summary">
                      <a class="event-summary__date t-center" href="${item.per}">
                          <span class="event-summary__month">
                              ${item.month}
                          </span>
                          <span class="event-summary__day">
                              ${item.day}
                          </span>
                      </a>
                    <div class="event-summary__content">
                        <h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5>
                        <p>
                            ${item.description}
                            <a href="${item.permalink}" class="nu gray">Learn more</a>
                        </p>
                    </div>
                  </div>  
                  `
              )
              .join("")}
          ${results.events.length ? `` : ""}
        </div>
      </div>
      `);
        this.isSpinnerVisible = false;
      }
    );
    //delete this code a bit later on
    // $.when(
    //   $.getJSON(
    //     `${
    //       university_data.root_url
    //     }/wp-json/wp/v2/posts?search=${this.searchField.val()}`
    //   ),
    //   $.getJSON(
    //     `${
    //       university_data.root_url
    //     }/wp-json/wp/v2/pages?search=${this.searchField.val()}`
    //   )
    // ).then((posts, pages) => {
    //   var combinedResults = posts[0].concat(pages[0]);
    //   console.log(combinedResults)
    //   this.resultsDiv.html(`
    //       <h2 class="search-overlay__section-title">General Information</h2>
    //       <ul class="link-list min-list">
    //       ${
    //         combinedResults.length
    //           ? `<ul class="link-list min-list">`
    //           : "<p>Nothing found</p>"
    //       }
    //         ${combinedResults
    //           .map(
    //             (item) =>
    //               `<li><a href="${item.link}">${item.title.rendered}</a> ${item.type == 'post' ? `by: ${item.authorName}` : ''}</li>`
    //           )
    //           .join("")}
    //       ${combinedResults.length ? `</ul>` : ""}
    //     `);
    //   this.isSpinnerVisible = false;
    // },() =>{
    //   this.resultsDiv.html('<p>Unexpected error; please try again.</p>')
    // });
  }

  keyPressDispatcher(e) {
    if (
      e.keyCode == 83 &&
      !this.isOverLayOpen &&
      !$("input, textarea").is(":focus")
    ) {
      this.openOverlay();
    }
    if (e.keyCode == 27 && this.isOverLayOpen) {
      this.closeOverlay();
    }
  }

  openOverlay() {
    this.searchOverlay.addClass("search-overlay--active");
    $("body").addClass("body-no-scroll");
    this.searchField.val("");
    setTimeout(() => {
      this.searchField.focus();
    }, 301);
    this.isOverLayOpen = true;
    return false;//prevent the default behaviour of the tag <a> and font redirect to search page 
  }

  closeOverlay() {
    this.searchOverlay.removeClass("search-overlay--active");
    $("body").removeClass("body-no-scroll");
    this.isOverLayOpen = false;
  }

  addSearchHTML() {
    $("body").append(`
      <div class="search-overlay">
        <div class="search-overlay__top">
            <div class="container">
                <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                <input type="text" name="" id="search-term" class="search-term" placeholder="What are you looking for?" autocomplete="off">
                <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
            </div>
        </div>
        <div class="container">
            <div id="search-overlay__result"></div>
        </div>
    </div>
    `);
  }
}

export default Search;
