Vue.component('cInfoModal', {
    template: `
      <div class="modal right fade search" id="infoModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header py-2 px-3">
              <h4 class="modal-title">About this app</h4>
              <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
              <div class="entry">This app is intended to showcase the capabilities of the <a href="https://circuit.github.io/jssdk">Circuit JavaScript SDK</a>. The source code is available on <a href="https://github.com/circuit/circuit-sdk-app">github</a>. 
              </div>

              <div class="entry">
                For more information on the SDK check out these links:
                <ul>
                  <li><a href="Register a sandbox account">https://www.circuit.com/web/developers/registration</a></li>
                  <li><a href="Register an OAuth 2.0 app">https://circuit.github.io/oauth.html</a></li>
                  <li><a href="JS SDK examples">https://circuit.github.io/jssdk.html</a></li>
                  <li><a href="Official Circuit github site">https://github.com/circuit</a></li>
                  <li><a href="JavaScript SDK API documentation ">https://circuitsandbox.net/sdk</a></li>
                  <li><a href="REST API ">https://circuit.github.io/rest.html</a></li>
                </ul>
              </div>

              <div class="entry">
                <div class="label">Roadmap (this app)</div>
                <ul>
                  <li>Status message (show and set)</li>
                  <li>Display RTC and System items in the feed</li>
                  <li>Creating conversations</li>
                  <li>Add call capabilities (voice, video & screenshare)</li>
                  <li>Load more (conversations, items, participants, etc)</li>
                  <li>Mentions</li>
                  <li>Labels</li>
                  <li>Show and update of profile information</li>
                  <li>Search</li>
                  <li>Editing of text messages</li>
                  <li>Telephony (ATC/UTC)</li>
                </ul>
              </div>

              <div class="entry">
                <div class="label">Third-party libraries</div>
                <ul>
                  <li><a href="https://circuit.github.io/jssdk.html">Circuit JS SDK</a></li>
                  <li><a href="https://vuejs.org/">Vue.js JavaScript Framework</a></li>
                  <li><a href="https://v4-alpha.getbootstrap.com/">Bootstrap v4-alpha</a></li>
                  <li><a href="https://quilljs.com">Quill Rich Text Editor</a></li>
                  <li><a href="http://fontawesome.io/">Font Awesome icons</a></li>
                  <li><a href="http://tether.io/">Tether positioning</a></li>
                  <li><a href="https://jquery.com/">JQuery</a></li>
                  <li><a href="https://momentjs.com/">Moment.js for date formatting</a></li>
                  <li><a href="http://lesscss.org/">LESS CSS pre-processor</a></li>
                </ul>
              </div>

              <div class="entry">
                <div class="label">Feedback</div>
                <div>Contact Roger Urscheler via <a href="https://eu.yourcircuit.com/#/email/rodrigo.pastro@unify.com">Circuit</a> or <a href="mailto:roger.urscheler@unify.com">email</a>.</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    `
});