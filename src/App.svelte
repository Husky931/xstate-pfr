<script>
import { Machine, interpret, assign, send, sendParent } from 'xstate'

const makeMachine = Machine({
  id: 'first-machine',
  initial: 'idle',
  context: {
    introPage: true,
    mainPage: false,
    showDropdownMenu: false,
    showAbsoluteMenu: false,
    newReportStateEnterCount: 0,
    checkBoxConfirm: false,
    pfrReportName: ''
  },
  states: {
    idle: {
      on: {
        SELECT_REPORT_EVENT: {
          target: 'selectState'
        }
      }
    },
    newReportState: {
      entry: ['flipShowAbsoluteMenu', 'increaseNewReportStateCount'],
      on: {
        SELECT_REPORT_EVENT: {
          target: 'selectState',
          actions: ['flipShowAbsoluteMenu']
        },
        SHOWREPORTPAGE: {
          target: 'mainPage',
          actions: ['introPage', 'mainPage']
        }
      }
    },
    selectState: {
      entry: ['flipShowDropdownMenu'],
      on: {
        NEW_REPORT_EVENT: {
          target: 'newReportState',
          actions: ['flipShowDropdownMenu']
        }
      }
    },
    mainPage: {
      id: 'main-page',
      initial: 'main-page-view',
      context: {
        muaha: 'huahaha'
      },
      states: {
        'main-page-view': {

        }
      }
    }
  },
  on: {
    INPUT_CHANGE: {
      actions: ['updatePfrReportNameContext']
    },
    NEW_REPORT_EVENT:  {
      target: 'newReportState'
    }
  }
},
{
  actions: {
    flipShowDropdownMenu: assign({
    showDropdownMenu: (context, event) => context.showDropdownMenu = !context.showDropdownMenu}),
    flipShowAbsoluteMenu: assign({
    showAbsoluteMenu: (context, event) => context.showAbsoluteMenu = !context.showAbsoluteMenu}),
    increaseNewReportStateCount: assign({
      newReportStateEnterCount: (context, event) => ++context.newReportStateEnterCount
    }),
    updatePfrReportNameContext: assign({
      pfrReportName: (context,  event) =>  context.pfrReportName = event.pfrReportName
    }),
    introPage: assign({
      introPage: (context,  event) =>  context.introPage = !context.introPage
    }),
    mainPage: assign({
      mainPage: (context,  event) =>  context.mainPage = !context.mainPage
    }),
  }
})
const service = interpret(makeMachine).onTransition(state => {
  console.log(state, 'i am the state consoled from the transition');
  makeMachine.context  = state.context
}).start()

function sentEvents(e){
  service.send(e)
}

let inputName = '';
$: service.send('INPUT_CHANGE', {pfrReportName: inputName})

</script>

<main>
  <div id='roof'>
    {#if makeMachine.context.introPage}

    <div class='divLikeBtn' on:click={()=>sentEvents('NEW_REPORT_EVENT')} >
      <h3>New report</h3>
    </div>
    {#if makeMachine.context.showAbsoluteMenu}
    <div id='absolute-center-div'style='position:absolute; left:50%; top:50%; transform: translate(-50%, -50%)'>
      <div id='center-div-main'>
        <div id='center-div-main-head'>
          <h3 id='center-div-main-head-h'>New PFR</h3>
        </div>
        <div id='center-div-main-body'>
          <p>Please name your new PRF report</p>
          <input bind:value={inputName} />
          <label>
            <input type='checkbox' bind:checked={makeMachine.context.checkBoxConfirm} />
            By checking this box, you agree to creating a new PFR report for 1
            Credit
          </label>
          {#if makeMachine.context.checkBoxConfirm}
          <button id='create-new-report-checked-btn' on:click={() => sentEvents('SHOWREPORTPAGE')}>Create new PFR report</button>
          {/if}
        </div>
      </div>

    </div>
  {/if}
    <div class='divLikeBtn' on:click={()=>sentEvents('SELECT_REPORT_EVENT')}>
      <h3>Select report</h3>
      {#if makeMachine.context.showDropdownMenu}
      <ul>
        <li>First</li>
        <li>Secondd</li>
        <li>Third</li>
        <li>Forth</li>
        <li>Fifth</li>
        <li>Sixth</li>
        <li>Seventh</li>
        <li>Eight</li>
        <li>Nine</li>
      </ul>
      {/if}
    </div>
    {/if}
  </div>

  {#if makeMachine.context.mainPage}
  <div id='main-page'>
    <div id='main-page-top'>
      <select>
        <option>
          {makeMachine.context.pfrReportName}
        </option>
        <option>
            Hey
          </option>
      </select>
      <!-- {console.log(makeMachine.context.pfrReportName)} -->
      <button>Save PFR report</button>
      <button>New PFR report</button>
    </div>
  </div>

  <div id='mid-part'>
    <div id='mid-part-boxes'>

      <div id='selected-items'>
        <div id='selected-items-top-row'>
          <h3>Selected: 0</h3>
          <input />
          <button>Go</button>
        </div>
        <div id='selected-items-body-row'>

        </div>
      </div>

      <div id='unselected-items'>
          <div id='unselected-items-top-row'>
            <h3>Selected: 0</h3>
            <input />
            <button>Go</button>
          </div>
          <div id='unselected-items-body-row'>

          </div>
        </div>


    </div>
  </div>


  {/if}
</main>

<style>
#roof {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin-top: 30px;
}
.divLikeBtn {
  border: 1px solid black;
  margin: 8px;
  padding: 7px;
}
li {
  cursor: pointer;
}
li:hover {
  background-color: lightblue;
}
#absolute-center-div {
  width: auto;
  height: auto;
  padding: 25px;
  padding-top: 0px;
  border: 1px solid black;
}
#center-div-main-head-h {
  border: 1.5 solid black;
}
#create-new-report-checked-btn {
  margin-top: 20px;
  cursor: pointer;
}
#main-page {
  border: 1px solid black;
}
#main-page-top {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  border: 1px solid black;
}
#main-page-top > * {
  margin-left: 10px;
  margin-left: 5px;
}

#mid-part-boxes {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center
}
#selected-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  height: 460px;
}
#selected-items-top-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid black;
}
#selected-items-body-row{
  height: 80%;
}
#unselected-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  height: 460px;
}
#unselected-items-top-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid black;
}
#unselected-items-body-row{
  height: 80%;
}
</style>
