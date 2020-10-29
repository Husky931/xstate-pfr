<script>
    import { Machine, interpret, assign, send, sendParent } from 'xstate'
    import makePromise from './ultils/fetchKW.js'

    const fetchKWMachine = Machine({
      id: 'fetchKW-machine',
      initial: 'receive_signal',
      context: {
        selectedKW: [],
        selectedKWLength: 0
      },
      states: {
        receive_signal: {
          invoke: {
            src: (context, event) => makePromise(),
            onDone: {
              target: 'success',
              actions: assign({
                selectedKW: (context, event) => event.data,
                selectedKWLength: (context, event) => event.data.length
              })
            },
            onError: {
              target: 'error'
            }
          }
        },
        success: {
          type: 'final',
          data: {
            selectedKW: (context, event) => context.selectedKW,
            selectedKWLength: (context, event) => context.selectedKWLength,
          }
        },
        error: {
         on: {
           '': 'receive_signal'
         }
        }
      }
    })

    const mainPageMachine = Machine({
      id: 'main-page',
      initial: 'main_page_overview',
      context: {
        searchKW: '',
        selectedKW: [],
        selectedKWLength: 0,
        unselectedKW: [],
        unselectedKWLength: 0
      },
      states: {
        main_page_overview: {},
        inputFetchState: {
          entry: () => console.log('here'),
          invoke: {
            src: fetchKWMachine,
            onDone: {
              target: 'selected_Items_State',
             actions: ['updateFetchKw', 'updateFetchKwLength', 'removeSearchKw']
            },
            onError: {
              target: 'failureState'
            }
          }
        },
        selected_Items_State: {
          on: {
            INVOKE_AGAIN: '',
            RELATED_ITEM: '',
          }
        },
        unselected_Items_State: {},
        failureState: {
          entry: {
            actions: [()=>console.log('i am in failure state')]
          }
        }
      },
      on: {
        INPUT_CHANGE: {
          actions: ['updateSearchKW']
        },
        TRANSFER_SELECTED: {
          actions: ['transferSelected']
        },
        TRANSFER_UNSELECTED: {
          actions: ['transferUnselected']
        },
        TRANSFER_SELECTED_ALL: {
          actions: ['transferSelectedAll']
        },
        TRANSFER_UNSELECTED_ALL: {
          actions: ['transferUnselectedAll']
        },
        inputFetchEvent: {
          target: 'inputFetchState',
          cond: 'searchValidate'
        }
      }
    },
    {
      actions: {
        updateSearchKW: assign({
          searchKW: (context, event) => context.searchKW = event.searchKW
        }),
        updateFetchKw: assign({
          selectedKW: (context, event) => [...context.selectedKW, ...event.data.selectedKW]
        }),
        updateFetchKwLength: assign({
          selectedKWLength: (context, event) =>  event.data.selectedKWLength
        }),
        removeSearchKw: assign({
          searchKW: (context, event) =>  context.searchKW = '',
        }),
        transferSelected: assign({
          unselectedKW: (context, event) => context.unselectedKW = [...context.unselectedKW].concat(context.selectedKW[event.elementIndex]),
          selectedKW: (context, event) => {
            context.selectedKW.splice(event.elementIndex, 1)
            return [...context.selectedKW]},
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length,
        }),
        transferUnselected: assign({
          selectedKW: (context, event) => context.selectedKW = [...context.selectedKW].concat(context.unselectedKW[event.elementIndex]),
          unselectedKW: (context, event) => {
            context.unselectedKW.splice(event.elementIndex, 1)
            return [...context.unselectedKW]},
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length,
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
        }),
        transferSelectedAll: assign({
          unselectedKW: (context, event) => [...context.unselectedKW, ...context.selectedKW],
          selectedKW: (context, event) => [],
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length,
        }),
        transferUnselectedAll: assign({
          selectedKW: (context, event) => [...context.selectedKW, ...context.unselectedKW],
          unselectedKW: (context, event) => [],
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length,
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
        }),
        },
      guards: {
        searchValidate: (context, event) => {
          return context.searchKW.length > 3
        }
      }
    }
    )

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
        pfrReportName: '',
        selectedReports: ['one', 'two', 'three']
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
          ...mainPageMachine
        }
      },
      on: {
        INPUT_CHANGE: {
          actions: ['updatePfrReportNameContext']
        },
        NEW_REPORT_EVENT:  {
          target: 'newReportState',
          actions: ['turnOnIntro'],
        },

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
        turnOnIntro: assign({
          introPage: (context,  event) =>  context.introPage = true
        }),

      }
    })


    const service = interpret(makeMachine).onTransition(state =>{
      console.log(state.context, 'makeMachine');
      makeMachine.context = state.context
    }).start()
    let inputName = '';
    $: service.send('INPUT_CHANGE', {pfrReportName: inputName})


    let searchKW = ''
    const service2 = interpret(mainPageMachine).onTransition(state => {
      console.log(state.value, 'mainPageMachine');
      mainPageMachine.context = state.context
    }).start()
    $: service2.send('INPUT_CHANGE', {searchKW: searchKW})


    function sentEvents(e){
      service.send(e)
    }
    function sentEvents2(e){
      service2.send(e);
      searchKW = '';
    }

    function transferSelectedtoUnselected(elementIndex){
      service2.send('TRANSFER_SELECTED', {elementIndex: elementIndex})
    }
    function transferUnselectedtoSelected(elementIndex){
      service2.send('TRANSFER_UNSELECTED', {elementIndex: elementIndex})
    }

    </script>

    <main>
      <div id='roof'>
        <div id='main-page-top'>
            <select>
              <option>
                {makeMachine.context.pfrReportName}
              </option>
              <option>
                  Hey
                </option>
            </select>
            <button on:click={()=>sentEvents('SELECT_REPORT_EVENT')}>Select report</button>
          <button on:click={()=>sentEvents('NEW_REPORT_EVENT')}>New PFR report</button>
          </div>
        {#if makeMachine.context.introPage}
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
        {/if}
      </div>
      {#if makeMachine.context.mainPage}
      <div id='mid-part'>
        <div id='mid-part-boxes'>
          <div id='selected-items'>
            <div id='selected-items-top-row'>
              <h3>Selected: {mainPageMachine.context.selectedKWLength}</h3>
              <input bind:value={searchKW} />
              <button on:click={()=>sentEvents2('inputFetchEvent')}>Go</button>
              <button on:click={() => service2.send('TRANSFER_UNSELECTED_ALL')}>ALL</button>
            </div>
            <div id='selected-items-body-row'>
              <ul >
              {#each mainPageMachine.context.selectedKW as selectedKW, i}
                <li on:click={() => transferSelectedtoUnselected(i)}>{selectedKW}</li>
              {/each}
              </ul>
            </div>
          </div>
          <div id='unselected-items'>
            <div id='unselected-items-top-row'>
              <h3>Unselected: {mainPageMachine.context.unselectedKWLength}</h3>
              <button on:click={() => service2.send('TRANSFER_SELECTED_ALL')}>ALL</button>
            </div>
            <div id='unselected-items-body-row'>
              <ul>
                {#each mainPageMachine.context.unselectedKW as unselectedKW, i}
                  <li on:click={() => transferUnselectedtoSelected(i)}>{unselectedKW}</li>
                {/each}
              </ul>
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
      align-items: center;
      flex-basis: 100%;
    }
    #selected-items {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px solid black;
      height: 460px;
      width: 350px;
    }
    #selected-items-top-row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-bottom: 2px solid black;
    }
    #selected-items-body-row{
      height: auto;
    }
    #unselected-items {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px solid black;
      height: 460px;
      width: 350px;
    }
    #unselected-items-top-row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-bottom: 2px solid black;
      width: 90%;
    }
    #unselected-items-body-row{
      height: 80%;
    }
    #intro-page-buttons {
      border: 1px solid black;
      width: 90%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
    </style>
