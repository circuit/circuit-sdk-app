Vue.component('cThreadShortcut', {
    template: `
      <div class="col-4 thread-shortcuts">
        <div class="h5 fixed ml-3 title fw4">Thread shortcuts</div>
        <nav class="bs-docs-sidebar">
          <ul class="nav flex-column fixed">
            <li class="nav-item" v-for="thread in conversation.threads" :key="thread.parentItem.itemId" v-if="thread.parentItem.type=='TEXT'">
              <a class="nav-link" :href="'#' + thread.parentItem.itemId">{{thread.parentItem.teaser}}</a>
            </li>
          </ul>
        </nav>
      </div>
    `,
    props: {
        conversation: {
            type: Object
        }
    }
});