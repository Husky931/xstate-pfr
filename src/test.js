

function returnRandom(){
  const options = ['rock', 'paper', 'scissor']
  const randomNumber = Math.floor(Math.random() * 3)
  const value = options[randomNumber]
  return value;
}


console.log(returnRandom())




