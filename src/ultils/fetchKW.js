function returnRandom(){
  const options = ['rock', 'paper', 'scissor']
  const randomNumber = Math.floor(Math.random() * 3)
  const value = options[randomNumber]
  return value;
}

function randomArray(){

}
var firstArray = [
  'januar1',
  'januar2',
  'januar3',
  'januar4',
  'januar5',
  'januar6',
  'januar7',
  'januar8',
  'januar9',
  'januar10',
  'januar11',
  'januar12',
]


function makePromise(){
  const random = returnRandom()
  const promise = new Promise((resolve, reject) => {
    if (random === 'paper') {
      return resolve(firstArray)
    }
    else {
      return reject('error B52')
    }
  })
  return promise
}

export default makePromise;