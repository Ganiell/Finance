const Modal = {
    modals: document.querySelectorAll('.modal-overlay'),

    open(index){
        Modal.modals[index].classList.add('active')
    },
    close(index){
        Modal.modals[index].classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },
    sureRemove(index){
        Transaction.all.splice(index, 1)
        App.reload()
        console.log(index)
        Modal.close(1)    
    },
    remove(index){
        Modal.open(1)
        document.getElementById('modal-remove').innerHTML = `
            <Button class="button cancel" onclick="Modal.close(1)">Cancelar</Button>
            <button onclick="Transaction.sureRemove(${index})">Sim</button>
        `
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const Table = {
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = Table.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        document.querySelector('table tbody').appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const incomeOrExpense = transaction.amount < 0 ? 'expense' : 'income'
    
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${incomeOrExpense}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        document.querySelector('table tbody').innerHTML = ""
    } 
}

const Utils = {
    formatAmount(value){
        // value = Number(value.replace(/\,\./g, "")) * 100
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style : "currency",
            currency: "BRL"
        })
        
        return `${signal}${value}`
    }
}

const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateField(){
        const {description, amount, date } = Form.getValues()

        if(!description || !amount || !date) {
            throw new Error("Por favor, Preencha todos os campos")
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields() 
            Modal.close(0)

        } catch (error) {
            window.alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            Table.addTransaction(transaction, index)
        })

        Table.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        Table.clearTransactions()
        App.init()
    }
}

App.init()



