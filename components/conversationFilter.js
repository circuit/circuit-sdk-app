Vue.component('cConversationFilter', {
    template: `
        <div class="d-flex flex-row conv-filter px-1 pt-2 pb-1">
          <button class="btn-link mr-auto"></button>

          <div v-show="!filterDisplay">
            <div class="dropdown">
              <button class="btn-link pl-0 mr-1" v-show="!filterDisplay" type="button" data-toggle="dropdown">
                <span class="fa fa-sort-amount-desc"></span>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <button class="dropdown-item btn-sm" v-for="filter in filters" v-on:click="select(filter.id)" type="button">{{filter.name}}</button>
              </div>
            </div>
          </div>
          <div class="d-flex">
            <div class="dropdown" v-show="!!filterDisplay">
              <button class="btn-link named-dropdown" type="button" data-toggle="dropdown">
                <span>{{filterDisplay}}</span>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <button class="dropdown-item btn-sm" v-for="filter in filters" v-on:click="select(filter.id)" type="button">{{filter.name}}</button>
              </div>
            </div>
            <button class="btn-link mr-1" type="button" v-show="!!filterDisplay" v-on:click="select('all')">
              <span class="fa fa-times"></span>
            </button>
          </div>
        </div>
    `,
    data: function () {
        return {
            selectedFilter: null
        }
    },
    props: {
        filters: {
            type: Array
        }
    },
    computed: {
        filterDisplay: function () {
            return (this.selectedFilter && this.selectedFilter.id !== 'all') ? this.selectedFilter.name : '';
        }
    },
    methods: {
        select: function (id) {
            this.selectedFilter = this.filters.find(s => { return s.id === id; });
            this.$emit('filter-changed', id);
        }
    }
});