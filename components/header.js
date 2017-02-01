Vue.component('cHeader', {
    template: `
      <nav id="header" class="navbar navbar-inverse bg-inverse p-1">
        <form class="form-inline mr-3 ml-2">
          <a class="navbar-text p-0" data-toggle="modal" data-target="#profileModal">
            <c-avatar :user="user"></c-avatar>
            {{user && user.firstName}}
          </a>
          <a tabindex="1" class="nav-item ml-auto" data-toggle="modal" data-target="#infoModal">
            <span class="fa fa-info"></span>
          </a>
          <a tabindex="1" class="nav-item ml-2" data-toggle="modal" data-target="#searchModal">
            <span class="fa fa-search"></span>
          </a>
          <a tabindex="1" class="nav-item ml-2" data-toggle="modal" data-target="#notificationsModal">
            <span class="fa fa-bell"></span>
          </a>
        </form>
      </nav>
    `,
    props: {
        user: {
            type: Object
        }
    }
});