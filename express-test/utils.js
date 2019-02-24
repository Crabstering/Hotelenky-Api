function sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sekvencni pripojovani promises
async function sequenceAdd(promise, arg1, arg2, otherPromise) {
   return promise.then(() => {
       return otherPromise(arg1, arg2)
   })
}

module.exports = {
   sleep: sleep,
   sequenceAdd: sequenceAdd
}