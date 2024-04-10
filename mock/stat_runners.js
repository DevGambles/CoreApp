async function onceRunner(runFunc) {
    try{
        const startTime = new Date();
        await runFunc();
        const endTime = new Date();
        console.log('Elapsed Time in Second', (endTime - startTime) / 1000);
    } catch(e) {
        console.log(e);
    } finally {
        process.exit(1);
    }
}

async function intervalRunner(runFunc, interval) {
    async function trigger() {
        try{
            const startTime = new Date();
            await runFunc();
            const endTime = new Date();
            const elapsedTime = endTime - startTime;
            const nextInterval = interval - elapsedTime;

            if(nextInterval <= 0) {
                setTimeout(trigger, interval);
            } else {
                setTimeout(trigger, nextInterval);
            }

            console.log('Elapsed Time in Second', elapsedTime / 1000);
        } catch(e) {
            console.log(e);
        } finally {
            process.exit(1);
        }
    }

    setTimeout(trigger, interval);
}
module.exports = {onceRunner, intervalRunner}