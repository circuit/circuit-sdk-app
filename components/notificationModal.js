Vue.component('cNotificationModal', {
    template: `
      <div class="modal right fade" id="notificationsModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header py-2 px-3">
              <h4 class="modal-title">Notifications</h4>
              <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
              <p>
              Show mentions and other notifications (todo)<br>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
});