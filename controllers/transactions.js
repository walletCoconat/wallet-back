const { databaseApi } = require("../repository")
const { CustomError } = require("../helpers/errorHandler")
const {
	HttpCode,
	errorConstants,
	categoriesConstants,
} = require("../helpers/constants")

const getTransactions = async ({ user, query }, res) => {
	const { id: userId, loginToken } = user
	const { limit = 5, offset = 0 } = query
	const searchOptions = { owner: userId }
	const response = await databaseApi.getAllTransaction(searchOptions, {
		limit,
		offset,
		sort: { date: -1 },
	})
	res.json({
		status: "success",
		code: HttpCode.OK,
		loginToken,
		response,
	})
}

const getTransaction = async (req, res) => {
	const { id: userId, loginToken } = req.user
	const transaction = await databaseApi.getTransactionById(
		req.params.transactionId,
		userId,
	)
	if (transaction) {
		return res.status(HttpCode.OK).json({
			status: "success",
			code: HttpCode.OK,
			loginToken,
			response: {
				transaction,
			},
		})
	}
	throw new CustomError(
		HttpCode.NOT_FOUND,
		"Transaction not found",
		errorConstants.TRANSACTION_ID_ERROR,
	)
}

const saveTransaction = async ({ user, body }, res) => {
	const { id: userId, loginToken } = user
	const { balance } = await databaseApi.updateBalance(
		userId,
		body.sum,
		body.type,
	)
	const dataSeconds = new Date(+body.date)
	console.log("dataSeconds", +body.date, dataSeconds)
	console.log(
		`${dataSeconds.getFullYear()}-${
			dataSeconds.getMonth() + 1
		}-${dataSeconds.getDate()}`,
	)

	const month = dataSeconds.getMonth() + 1
	const day = dataSeconds.getDate()
	const response = await databaseApi.createTransaction({
		...body,
		owner: userId,
		balance,
		date: `${dataSeconds.getFullYear()}-${month < 10 ? `0${month}` : month}-${
			day < 10 ? `0${day}` : day
		}`,
		// sortDate: +body.date,
	})
	res.status(HttpCode.CREATED).json({
		status: "success",
		code: HttpCode.CREATED,
		loginToken,
		response,
	})
}

const changeTransaction = async (req, res) => {
	const { id: userId, loginToken } = req.user
	const transaction = await databaseApi.updateTransaction(
		req.params.transactionId,
		req.body,
		userId,
	)
	if (transaction) {
		return res.status(HttpCode.OK).json({
			status: "success",
			code: HttpCode.OK,
			loginToken,
			response: {
				transaction,
			},
		})
	}
	throw new CustomError(
		HttpCode.NOT_FOUND,
		"Transaction not found",
		errorConstants.TRANSACTION_ID_ERROR,
	)
}

const deleteTransaction = async (req, res) => {
	const { id: userId, loginToken } = req.user
	const response = await databaseApi.removeTransaction(
		req.params.transactionId,
		userId,
	)

	if (response) {
		return res.status(HttpCode.OK).json({
			status: "success",
			code: HttpCode.OK,
			loginToken,
			response,
		})
	}
	throw new CustomError(
		HttpCode.NOT_FOUND,
		"Transaction not found",
		errorConstants.TRANSACTION_ID_ERROR,
	)
}

const getStatistic = async ({ user, query }, res) => {
	const { id: userId, loginToken } = user
	const { month = null, year = null } = query

	let searchOptions = { owner: userId }

	const transactions = await databaseApi.getStat(searchOptions)

	const renderColor = () => Math.round(Math.random() * (250 - 0) + 0)
	const renderRGBColor = callback =>
		`rgb(${callback()}, ${callback()}, ${callback()})`

	const response = transactions.reduce(
		(acc, el) => {
			if (month) {
				const testMonth = el.date.split("-")[1]

				if (month !== testMonth) return acc
			}

			if (year) {
				const testYear = el.date.split("-")[0]
				console.log(el.date.split("-")[0] === year)
				if (year !== testYear) return acc
			}
			const index = acc.list.findIndex(item => item.type === el.category)
			const oldList = acc.list

			acc = el.type
				? {
						...acc,
						amounts: {
							...acc.amounts,
							income: acc.amounts.income + el.sum,
						},
				  }
				: {
						...acc,
						list:
							index === -1
								? [
										...oldList,
										{
											summary: el.sum,
											type: el.category,
											color: renderRGBColor(renderColor),
										},
								  ]
								: [
										...oldList.map(item => {
											if (item.type === el.category) {
												return {
													...item,
													summary: oldList[index].summary + el.sum,
												}
											}
											return item
										}),
								  ],
						amounts: {
							...acc.amounts,
							expense: acc.amounts.expense + el.sum,
						},
				  }
			return acc
		},
		{
			list: [],
			amounts: { income: 0, expense: 0 },
		},
	)

	return res.status(HttpCode.OK).json({
		status: "success",
		code: HttpCode.OK,
		loginToken,
		response,
	})
}

module.exports = {
	getTransactions,
	getTransaction,
	saveTransaction,
	changeTransaction,
	deleteTransaction,
	getStatistic,
}
