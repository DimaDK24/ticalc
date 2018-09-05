import React from 'react'
import {
    Button,
    Cell,
    Div,
    Group,
    Header,
    List,
    Panel,
    PanelHeader,
    ScreenSpinner,
    View
} from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import SweetSelect from './SweetSelect'
import {MoneyIndicator, SummaryMoneyIndicator} from './indicators'
import PropTypes from 'prop-types'
import {convertResults} from './helpers'

let state = {
    calculationResults: {
        status: 'notSelected',
        works: [],
        materials: []
    },
    popout: null
}
Object.assign(state, getDefaultSelectState('Выбрать'))

function getDefaultSelectState(text) {
    return {
        model: {id: 0, text},
        modification: {id: 0, text},
        oldness: {id: 0, text}
    }
}

class Home extends React.Component {
    static propTypes = {
        onCtaClick: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = state
        state.activePanel = this.props.id + 'main'
    }

    get resultsStatus() {
        return this.state.calculationResults.status
    }

    changePanel(id) {
        this.setState({activePanel: id})
    }

    componentWillUnmount() {
        state = this.state
    }

    goHome() {
        this.changePanel(this.props.id + 'main')
    }

    ctaText = `Отправьте заявку, мы свяжемся с вами за час и подскажем, как привести вашу ласточку в идеальное состояние :)`

    models = [{id: 1, value: 'Almera Classic (2006-2013)'}]

    modifications = [{id: 1, value: 'лучшая'}]

    oldnesses = [{id: 1, value: '15000 или 1 год'}]

    getModelSelectIndicator() {
        return (
            <Cell
                indicator={this.state.model.text}
                onClick={() => this.changePanel('chooseModel')}
            >
                Модель авто
            </Cell>
        )
    }

    getModificationSelectIndicator() {
        return (
            <Cell
                indicator={this.state.modification.text}
                onClick={() => this.changePanel('chooseModification')}
            >
                Модификация
            </Cell>
        )
    }

    getOldnessSelectIndicator() {
        return (
            <Cell
                indicator={this.state.oldness.text}
                onClick={() => this.changePanel('chooseOldness')}
            >
                Пробег или время
            </Cell>
        )
    }

    panelHeader = <PanelHeader>Расчет ТО</PanelHeader>

    getSelectIndicatorList() {
        return (
            <List>
                {this.getModelSelectIndicator()}
                {this.getModificationSelectIndicator()}
                {this.getOldnessSelectIndicator()}
            </List>
        )
    }

    getCalculationSelectGroup() {
        return (
            <Group>
                <Header>
                    Рассчитайте стоимость технического обслуживания машины:
                </Header>
                {this.getSelectIndicatorList()}
            </Group>
        )
    }

    getResultWorkGroup() {
        return (
            <Group title={'Работы'}>
                {this.state.calculationResults.works.map((item, index) => (
                    <MoneyIndicator
                        text={item.name}
                        value={item.price}
                        key={index}
                    />
                ))}
                {
                    <SummaryMoneyIndicator
                        text={'Всего по работам'}
                        value={this.getSummaryValue('works')}
                    />
                }
            </Group>
        )
    }

    getResultMaterialGroup() {
        return (
            <Group title={'Материалы'}>
                {this.state.calculationResults.materials.map((item, index) => (
                    <MoneyIndicator
                        text={item.name}
                        value={item.price}
                        key={index}
                    />
                ))}

                <SummaryMoneyIndicator
                    text={'Всего по материалам'}
                    value={this.getSummaryValue('materials')}
                />
            </Group>
        )
    }

    getSummaryValue(thing) {
        return this.state.calculationResults[thing].reduce(
            (accumulator, currentValue) => accumulator + currentValue.price,
            0
        )
    }

    getResultSummaryGroup() {
        return (
            <Group>
                <SummaryMoneyIndicator
                    text={'Итого'}
                    value={
                        this.getSummaryValue('works') +
                        this.getSummaryValue('materials')
                    }
                />
            </Group>
        )
    }

    getCalculationResultGroups() {
        return (
            <div>
                {this.resultsStatus === 'ready' && (
                    <div>
                        {this.getResultWorkGroup()}
                        {this.getResultMaterialGroup()}
                        {this.getResultSummaryGroup()}
                    </div>
                )}
            </div>
        )
    }

    ctaButton = (
        <Button
            align="center"
            stretched
            size="l"
            onClick={() => this.props.onCtaClick()}
        >
            Отправить заявку
        </Button>
    )

    ctaComponent = (
        <Div>
            <p>{this.ctaText}</p>
            {this.ctaButton}
        </Div>
    )

    render() {
        return (
            <View
                id={this.props.id}
                activePanel={this.state.activePanel}
                header
                popout={this.state.popout}
            >
                <Panel id={this.props.id + 'main'}>
                    {this.panelHeader}
                    {this.getCalculationSelectGroup()}
                    {this.getCalculationResults()}
                    {this.ctaComponent}
                </Panel>
                <SweetSelect
                    id="chooseModel"
                    backClickHandler={() => this.goHome()}
                    header="Модель"
                    items={this.models}
                    onSelect={async (item) => {
                        this.showSpinner()
                        this.resetModification()
                        await this.setModifications(item.id)
                        this.setSelectValueAndTryToCalculateResults(
                            'model',
                            item
                        )
                        this.removeSpinner()
                    }}
                />
                <SweetSelect
                    id="chooseModification"
                    backClickHandler={() => this.goHome()}
                    header="Модификация"
                    items={this.modifications}
                    onSelect={(item) =>
                        this.setSelectValueAndTryToCalculateResults(
                            'modification',
                            item
                        )
                    }
                />
                <SweetSelect
                    id="chooseOldness"
                    backClickHandler={() => this.goHome()}
                    header="Пробег или время"
                    items={this.oldnesses}
                    onSelect={(item) =>
                        this.setSelectValueAndTryToCalculateResults(
                            'oldness',
                            item
                        )
                    }
                />
            </View>
        )
    }

    resetModification() {
        this.setState({modification: {id: 0, text: 'Выбрать'}})
    }

    setSelectValueAndTryToCalculateResults(key, item) {
        this.setState(
            {[key]: this.convertFromSweetSelectToHomeItemsFormat(item)},
            this.tryToCalculateResults
        )
    }

    convertFromSweetSelectToHomeItemsFormat(item) {
        return {
            id: item.id,
            text: item.value
        }
    }

    async tryToCalculateResults() {
        if (this.allSelected()) {
            await this.calculateResults()
        }
    }

    async calculateResults() {
        this.setLoadingStatus()
        const results = await this.loadResults()
        this.setCalculationResults(results)
    }

    async loadResults() {
        return new Promise((resolve) => {
            setTimeout(() => {
                let results = [
                    {
                        MATERIAL_NAME: 'Моторное масло (DPF) 8л.',
                        MATERIAL_PRICE: '5600',
                        SERVICE_NAME:
                            'Замена моторного масла (без снятия защиты ДВС)',
                        SERVICE_PRICE: '600'
                    }
                ]
                results = convertResults(results)
                return resolve(results)
            }, 1000)
        })
    }

    setLoadingStatus() {
        this.setState((state) => {
            Object.assign(state.calculationResults, {status: 'loading'})
            return state
        })
    }

    allSelected() {
        return (
            this.getSelectedModelId() &&
            this.getSelectedModificationId() &&
            this.getSelectedOldnessId()
        )
    }

    getSelectedOldnessId() {
        return this.state.oldness.id
    }

    getSelectedModificationId() {
        return this.state.modification.id
    }

    getSelectedModelId() {
        return this.state.model.id
    }

    getCalculationResults() {
        const switcher = {
            notSelected: null,
            loading: this.getSpinner(),
            ready: this.getCalculationResultGroups()
        }
        return switcher[this.resultsStatus]
    }

    getSpinner() {
        return <ScreenSpinner />
    }

    async setModifications(modelId) {
        let modifications = await this.loadModifications(modelId)
        modifications = this.convertModifications(modifications)
        this.modifications = modifications
        this.setState({
            modification: this.convertFromSweetSelectToHomeItemsFormat(
                modifications[0]
            )
        })
    }

    async loadModifications(modelId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {67219: '1.6л., бензин, 107 л.с., АКПП'},
                    {67267: '1.6л., бензин, 107 л.с., МКПП'}
                ])
            }, 1000)
        })
    }

    convertModifications(modifications) {
        return modifications.map((item) => {
            return {
                id: this.getItemId(item),
                value: this.getItemValue(item)
            }
        })
    }

    getItemId(item) {
        return Number.parseInt(Object.keys(item)[0], 10)
    }

    getItemValue(item) {
        return Object.values(item)[0]
    }

    showSpinner() {
        this.setState({popout: <ScreenSpinner />})
    }

    removeSpinner() {
        this.setState({popout: null})
    }

    setCalculationResults(results) {
        this.setState({
            calculationResults: {
                status: 'ready',
                ...results
            }
        })
    }
}
export {Home}