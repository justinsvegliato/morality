'use strict'

function CostFunction(state, policy, decisionMakingModel, ethicalContext) {
    total_cost = 0

    for (let i = 0; i < decisionMakingModel.actions().length; i++) {
        total_cost += policy(state, action) * ()
    }

    return total_cost
}

function MoralPrinciple(policy, decisionMakingModel, ethicalContext) {
    for (let i = 0; i < decisionMakingModel.states().length; i++) {
        state = decisionMakingModel.states()[i]

        cost = costFunction(state)
        threshold = ethicalContext.thresholdFunction(state)

        if (cost > threshold) {
            return False
        }
    }
    return True
}

module.exports = {
    MoralPrinciple
}
