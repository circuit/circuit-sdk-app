Vue.component('cSearchModal', {
    template: `
      <div class="modal right fade search" id="searchModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header py-2 px-3">
              <h4 class="modal-title">Search</h4>
              <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
              <p>
              Search input and results (todo)<br>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
});