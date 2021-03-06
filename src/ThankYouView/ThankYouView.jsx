import { Button, Cell, Group, Panel, View } from '@vkontakte/vkui'
import React from 'react'
import PropTypes from 'prop-types'
import PanelHeader from '../helpers/PanelHeader'
import { reachGoal } from '../helpers/production_utils'
import './ThankYouView.css'

class ThankYouView extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
  }

  onGoToPublic = () => {
    reachGoal('open-vk-public')
    return true
  }

  render() {
    const { id: viewId, onBack } = this.props
    const panelId = `${viewId}main`
    return (
      <View id={viewId} activePanel={panelId}>
        <Panel id={panelId}>
          <PanelHeader onBackButtonClick={() => onBack()} text="Спасибо" />
          <Group>
            <Cell multiline>
              <div>Спасибо!</div>
              <div>Наш менеджер свяжется с Вами в ближайшее время.</div>
            </Cell>
            <Cell multiline>
              <span className="thank-you-view__visit-group-text">
                А пока зайдите в наше сообщество ВКонтакте
              </span>
              <Button
                component="a"
                href="//vk.com/ya.service.nissan"
                target="_blank"
                rel="noopener noreferrer"
                onClick={this.onGoToPublic}
                level="commerce"
                stretched
                size="xl"
                style={{ marginTop: '15px' }}
              >
                Перейти
              </Button>
            </Cell>
          </Group>
        </Panel>
      </View>
    )
  }
}

export default ThankYouView
