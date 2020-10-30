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
        main_page_overview: {

        },
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
          actions: ['transferSelected','adjustKWlength']
        },
        TRANSFER_UNSELECTED: {
          actions: ['transferUnselected', 'adjustKWlength']
        },
        TRANSFER_SELECTED_ALL: {
          actions: ['transferSelectedAll', 'adjustKWlength']
        },
        TRANSFER_UNSELECTED_ALL: {
          actions: ['transferUnselectedAll', 'adjustKWlength']
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
        }),
        transferUnselected: assign({
          selectedKW: (context, event) => context.selectedKW = [...context.selectedKW].concat(context.unselectedKW[event.elementIndex]),
          unselectedKW: (context, event) => {
            context.unselectedKW.splice(event.elementIndex, 1)
            return [...context.unselectedKW]},
        }),
        transferSelectedAll: assign({
          unselectedKW: (context, event) => [...context.unselectedKW, ...context.selectedKW],
          selectedKW: (context, event) => [],

        }),
        transferUnselectedAll: assign({
          selectedKW: (context, event) => [...context.selectedKW, ...context.unselectedKW],
          unselectedKW: (context, event) => [],
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length,
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
        }),
        adjustKWlength: assign({
          selectedKWLength: (context, event) =>  context.selectedKWLength = context.selectedKW.length,
          unselectedKWLength: (context, event) =>  context.unselectedKWLength = context.unselectedKW.length
        })
        },
      guards: {
        searchValidate: (context, event) => {
          return context.searchKW.length > 0
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
        selectedReports: []
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
            SHOWREPORTPAGE: {
              target: 'mainPage',
              actions: ['introPage', 'mainPage', 'flipShowDropdownMenu', 'addNameToReports']
            }
          },
          exit: ['flipShowAbsoluteMenu']
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
          target: 'newReportState'
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
        addNameToReports: assign({
          selectedReports: (context,  event) =>  context.selectedReports.concat(context.pfrReportName)
        }),
      }
    })


    const service = interpret(makeMachine).onTransition(state =>{
      console.log(state, 'makeMachine');
      makeMachine.context = state.context
    }).start()
    let inputName = '';
    $: service.send('INPUT_CHANGE', {pfrReportName: inputName})


    let searchKW = ''
    const service2 = interpret(mainPageMachine).onTransition(state => {
      console.log(state, 'mainPageMachine');
      mainPageMachine.context = state.context
    }).start()
    $: service2.send('INPUT_CHANGE', {searchKW: searchKW})


    function firstMachineEvents(e){
      service.send(e)
    }
    function mainPageEvents(e){
      service2.send(e);
      searchKW = '';
    }

    function transferSelectedtoUnselected(elementIndex){
      service2.send('TRANSFER_SELECTED', {elementIndex: elementIndex})
    }
    function transferUnselectedtoSelected(elementIndex){
      service2.send('TRANSFER_UNSELECTED', {elementIndex: elementIndex})
    }
    function transferAllSelectedToUnselected(){
      service2.send('TRANSFER_SELECTED_ALL')
    }
    function transferAllUnselectedToSelected(){
      service2.send('TRANSFER_UNSELECTED_ALL')
    }

    </script>

    <main>
      <div class='content-page'>
        <div class='content'>
        <div id='head-section'>
            <div id='flex-row'>
              <h3>PFR REPORTS</h3>
              <div id='head-sections-buttons'>
                <select on:click={()=>firstMachineEvents('SELECT_REPORT_EVENT')}>
                 {#each makeMachine.context.selectedReports as selectedReport, i}
                 <option>{selectedReport}</option>
                 {/each}
                </select>
                {#if makeMachine.context.mainPage}
                <button class='btn'>Save Report</button>
                {/if}
                <button class='btn' on:click={()=> firstMachineEvents('NEW_REPORT_EVENT')}>New Report</button>
              </div>
            </div>
          </div>

          {#if makeMachine.context.showAbsoluteMenu}
          <div class='modal-wrap'>
              <div class='modal-bg'></div>
              <div class='modal-content'>
                <div class='modal-header'>
                  <h3 class='heading'>New PFR</h3>
                </div>
                <div class='modal-body'>
                  <p>Please name your New Pfr report</p>
                  <input type='text' bind:value={inputName} />
                  <label>
                    <input type='checkbox' bind:checked={makeMachine.context.checkBoxConfirm} />
                    By checking this box, you agree to creating a new PFR report for 1
          Credit
                  </label>
                  {#if makeMachine.context.checkBoxConfirm}
                <button class='btn' id='btn-agree' on:click={() => firstMachineEvents('SHOWREPORTPAGE')}>Create new PFR report</button>
                {/if}
                </div>
              </div>
            </div>
          {/if}

          {#if makeMachine.context.mainPage}
            <div class='rw'>
              <div class='cl-50 selected'>
                <div class='card'>
                  <div class='card-header'>
                      <h3 class='card-title'>Selected Items: {mainPageMachine.context.selectedKWLength}</h3>
                  </div>
                  <div class='card-body'>
                    <div class='card-options'>
                        <input type='text' bind:value={searchKW} />
                        <button class='btn' id='btn-2' on:click={()=>mainPageEvents('inputFetchEvent')}>Search</button>
                      <button type='button' class='btn' on:click={() => transferAllSelectedToUnselected()}>All</button>
                    </div>
                    <ul class='selected-ul'>
                      {#each mainPageMachine.context.selectedKW as selectedKW, i}
                      <li on:click={() => transferSelectedtoUnselected(i)}>{selectedKW}</li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </div>

              <div class='cl-50 unselected'>
                <div class='card'>
                  <div class='card-header'>
                      <h3 class='card-title'>Unselected Items: {mainPageMachine.context.unselectedKWLength}</h3>
                  </div>
                  <div class='card-body'>
                    <div class='card-options'>
                      <button class='btn' on:click={() => transferAllUnselectedToSelected()}>All</button>
                    </div>
                    <ul class='unselected-ul'>
                      {#each mainPageMachine.context.unselectedKW as unselectedKW, i}
                      <li on:click={() => transferUnselectedtoSelected(i)}>{unselectedKW}</li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>


    </main>

    <style>
  .content-page {
    min-height: 100vh;
    z-index: 0;
    overflow: hidden;
    padding: 100px 30px 30px;
    background: rgb(249, 250, 253);
  }
    #whole-page{
      width: 100vw;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #head-section{
      width: 100%;
      height: 40px;
    }
    #flex-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    #head-sections-buttons {
      margin-right: 40px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
    h3 {
      margin-left: 20px;
      width: 100%;
    }
    #absolute-center-div {
      border: 1px solid black;
    }
.btn {
    border-radius: 3px;
    background-color: #ff2c54;
    border: 0;
    color: white;
    font-size: 0.8rem;
    cursor: pointer;
    outline: none;
    padding: 8px;
    min-width: 80px;
    box-shadow: 0 0;
    margin-right: 5px;
    box-shadow: 0 0.125rem 0.25rem 0 rgba(58, 59, 69, 0.2) !important;
    transition: all 0.3s ease;
    margin: 0;
    margin-left: 2px;
    margin-right: 2px;
}
#btn-2 {
  height: 31px;
  margin: 0;
  margin-left: 2px;
  margin-right: 2px;
}
select{
  -webkit-writing-mode: horizontal-tb !important;
  text-rendering: auto;
  color: -internal-light-dark(black, white);
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-indent: 0px;
  text-shadow: none;
  display: inline-block;
  text-align: start;
  appearance: menulist;
  box-sizing: border-box;
  align-items: center;
  white-space: pre;
  -webkit-rtl-ordering: logical;
  background-color: -internal-light-dark(rgb(255, 255, 255), rgb(59, 59, 59));
  cursor: default;
  margin: 0em;
  font: 400 13.3333px Arial;
  border-width: 1px;
  border-style: solid;
  border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
  border-image: initial;
  border-radius: 0.25rem;
  box-sizing: border-box;
  padding: 7px 5px;
  width: 150px;
  margin-right: 5px;
  box-shadow: rgba(58, 59, 69, 0.2) 0px 0.125rem 0.25rem 0px !important;
}
.modal-wrap {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-bg {
    background: #313a46e8;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
  .modal-content {
    max-width: 500px;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid #e3e6f0;
    border-radius: 0.35rem;
    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
  }
  .modal-header {
    padding: 16px 20px;
    margin-bottom: 0;
    background-color: #f8f9fc;
    border-bottom: 1px solid #e3e6f0;
}
.modal-body {
    padding: 16px 20px;
}
h2 {
  margin-top: 0;
  margin-bottom: 0;
  color: #ff2c54;
}
#btn-1 {
  margin-top: 11px;
}
.rw{
  display: flex;
  box-sizing: border-box;
  flex-wrap: wrap;
  width: 100%;
}
.cl-50 {
  width: 50%;
  padding: 10px;
  box-sizing: border-box;
}
/* .selected .card-body,
.unselected .card-body {
    min-height: 100px;
    max-height: 600px;
    overflow-y: auto;
  } */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid #e3e6f0;
    border-radius: 0.35rem;
    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}
.card-header {
    padding: 16px 20px;
    margin-bottom: 0;
    background-color: #f8f9fc;
    border-bottom: 1px solid #e3e6f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-body {
    flex: 1 1 auto;
    min-height: 1px;
    padding: 20px;
    display: flex;
    flex-direction: column;
}
h3.card-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: #f92c51;
    line-height: 1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.card-options {
    display: flex;
    align-items: center;
    flex-direction: row;
}
.icnbtn {
    padding: 5.5px !important;
    min-width: auto !important;
}
.search-btn {
    border-radius: 3px;
    background-color: #ff2c54;
    border: 1px solid;
    color: white;
    font-size: 0.8rem;
    cursor: pointer;
    outline: none;
    padding: 5.5px;
    box-shadow: 0 0;
    margin-left: -2px;
}
.icon {
    height: 21px;
    width: 21px;
}

label {
    display: flex;
    color: #949494;
    font-style: italic;
    font-size: 13px;
}
input[type="checkbox" i] {
    background-color: initial;
    cursor: default;
    appearance: checkbox;
    box-sizing: border-box;
    margin: 3px 3px 3px 4px;
    padding: initial;
    border: initial;
}
input[type='text'] {
    width: 100%;
    outline: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: 0.5px solid silver;
    outline: 0;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    border-radius: 0.25rem;
    display: flex;
    box-sizing: border-box;
    padding: 8px 5px;
    margin: 10px 0px;
}
h3 {
  margin-top: 0;
  margin-bottom: 0;
}

h3.heading {
    font-size: 16px;
    font-weight: 700;
    color: #ff2c54;
    margin-left: 0;
}
#btn-agree {
  margin-top: 10px;
}
form {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
li:hover{
  cursor: pointer;
  background-color: #949494;
}
    </style>
