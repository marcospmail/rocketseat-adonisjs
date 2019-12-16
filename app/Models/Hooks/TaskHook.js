'use strict'

const TaskHook = exports = module.exports = {}

TaskHook.sendNewTaskMail = async (taskInstance) => {
  if (!taskInstance.user_id || !taskInstance.dirty.user_id) {
    return
  }

  console.log('EXECUTOU')
}
