const {Machine, interpret } = require('xstate');

const lightMachine = Machine({
    strict: true,
    id: 'lightMachine',
    context: {
        isOn: false,
        isBroken: false
    },
    initial: "unlit",
    states: {
        unlit: {
            entry: ["enterunlit"],
            on: {
                LIT: {
                    target: "lit",
                    actions: ["lighting"]
                },
                STRIKE: {
                    actions: ['logBreaking'],
                    target: "broken",
                    cond: "isBroken"
                }
            },
            exit: ["exitunlit"]
        },
        lit: {
            entry: ["enterlit"],
            on: {
                UNLIT: {
                    target: "unlit"
                },
                STRIKE: {
                    actions: ['logBreaking'],
                    target: "broken",
                    cond: "isBroken"
                }
            },
            exit: ["exitlit"]
        },
        broken: {
            initial: "unknown",
            states: {
                unknown: {
                    always: [
                        {
                            target: "unmendable",
                            cond: "isUnmendable",
                        },
                        {
                            target: "#lightMachine.unlit",
                            actions: ["canmend"]
                        }
                    ]
                },
                unmendable: {
                    entry: ["cannotmend"],
                    type: "final"
                }
            }
        }
    }
}, {
    guards: {
        isUnmendable: (ctx, evt, meta) => {
            console.log('isUnmendable!!!', evt, meta.state.event);
            let cannotBeMended = true;
            if (meta.state.event.watts && meta.state.event.watts > 50) {
                cannotBeMended = false;
            }
            console.warn(`cannotBeMended: ${cannotBeMended}`);
            return cannotBeMended;
        },
        isBroken: (ctx, evt) => {
            console.log('isBroken');
            console.log(evt);
            let hasBroken = false;
            if (evt.material && evt.material === "glass") {
                hasBroken = true;
            }
            console.log(`hasBroken: ${hasBroken}`);
            return hasBroken;
        }
    },
    actions: {
        canmend: (ctx, evt) => {
            console.log('Yay! mended');
        },
        cannotmend: (ctx, evt) => console.log('Ooops! cant mend'),
        logBreaking: (ctx, evt) => {
            console.log(`I'm transitioning into breaking`);
        },
        enterlit: (ctx, evt) => {
            console.log('Im entering LIT state');
        },
        exitlit: (ctx, evt) => {
            console.log('Im exiting LIT state');
        },
        enterunlit: (ctx, evt) => {
            console.log('Im entering UNLIT state');
        },
        exitunlit: (ctx, evt) => {
            console.log('Im exiting UNLIT state');
        },
        lighting: (ctx, evt) => console.log('LIGHTING UPPPPP!!!!!!')
    }
});

const service = interpret(lightMachine)
    .onTransition(state => console.log(`\n stateVal = ${state.value}`))
    .start();
// console.log(service.initialState);


service.send({type: "LIT"});
// console.log(service.state);

service.send({type: "STRIKE"});
// console.log(`current state value: ${service.state.value}`);
console.log(`------------------------------------------------`);
service.send({type: "STRIKE", material: "glass"});
// service.send({type: "STRIKE", material: "glass", watts: 100});