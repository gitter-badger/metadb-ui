import { expect } from 'chai'
import * as utils from '../utils'

describe('search/utils', function () {
	describe('`createRangeFacet`', function () {
		describe('the object returned', function () {
			const NAME = 'date_created'
			const MIN = '2016-10'
			const MAX = '2017-04'
			const facetItem = utils.createRangeFacet(NAME, MIN, MAX)

			it('is an object', function () {
				expect(facetItem).to.be.an.object
			})

			it('contains a `type` prop set to "range"', function () {
				expect(facetItem).to.have.property('type')
				expect(facetItem.type).to.equal('range')
			})

			it('contains a `value` object with corresponding `begin` and `end` values', function () {
				expect(facetItem).to.have.property('value')
				expect(facetItem.value).to.be.an.object
				expect(facetItem.value).to.contain.all.keys(['begin', 'end'])

				expect(facetItem.value.begin).to.equal(MIN)
				expect(facetItem.value.end).to.equal(MAX)
			})

			it('contains a `label` prop with the concatted `min`/`max` values', function () {
				expect(facetItem).to.have.property('label')
				expect(facetItem.label).to.be.a.string
				expect(facetItem.label).to.contain(MIN)
				expect(facetItem.label).to.contain(MAX)
			})

			it('contains a `name` prop with the same value', function () {
				expect(facetItem).to.have.property('name')
				expect(facetItem.name).to.equal(NAME)
			})

			it('uses the min/begin value as the label if equal to max', function () {
				expect(utils.createRangeFacet(NAME, MIN, MIN).label).to.equal(MIN)
			})
		})
	})

	describe('`formatSearchQueryString`', function () {
		it('does nothing for empty values', function () {
			const empty = utils.formatSearchQueryString()

			expect(empty).to.equal('')
		})

		it('flattens facetItem objects into an array of values', function () {
			const input = {
				subject_ocm: [
					{ value: '200 COOL CATS' },
					{ value: '300 COOL DOGS' },
				]
			}

			const expected = {
				subject_ocm: input.subject_ocm.map(i => i.value)
			}

			const stringified = utils.formatSearchQueryString('', input)
			const parsed = utils.parse(stringified)

			expect(parsed.facets).to.deep.equal(expected)
		})

		it('passes facetItems with a `type` value into their own option param', function () {
			const TYPE = 'compliment'

			const input = {
				kind_words: [
					{value: 'COOL', type: TYPE},
					{value: 'NICE', type: TYPE},
					{value: 'LOVELY', type: TYPE},
				]
			}

			const stringified = utils.formatSearchQueryString('', input)
			const expected = utils.stringify({
				options: {
					[TYPE]: {
						kind_words: input.kind_words.map(i => i.value)
					}
				}
			})

			expect(stringified).to.equal(expected)
		})
	})

	describe('searchHistory utils', function () {
		// create a new stored-key so we don't accidentally
		// overwrite values that exist
		const hist = { ...utils.searchHistory }
		const TEST_KEY = hist.STORED_KEY = '!!test-search-history-key!!'

		after(function () {
			localStorage.removeItem(TEST_KEY)
		})

		describe('searchHistory#add', function () {
			afterEach(function () {
				hist.clear()
			})

			it('adds a search object to the history', function () {
				const search = { query: 'cool cats' }
				hist.add(search)

				const stored = hist.getAll()
				expect(stored).to.have.length(1)
				expect(stored[0]).to.deep.equal(search)
			})

			it('puts a new search object at front', function () {
				const searches = [
					{ query: 'fancy cats' },
					{ query: 'friendly dogs' },
				]

				searches.forEach(s => hist.add(s))

				const stored = hist.getAll()

				expect(stored).to.have.length(searches.length)
				expect(stored).to.not.deep.equal(searches)

				expect(stored[0]).to.deep.equal(searches[1])
				expect(stored[1]).to.deep.equal(searches[0])
			})

			it('only keeps as many new entries as specified by `searchHistory.STORED_LIMIT', function () {
				const prev = hist.STORED_LIMIT
				hist.STORED_LIMIT = 2

				for (let i = 0, max = hist.STORED_LIMIT + 2; i <= max; i++) {
					hist.add({ query: `cool-cats-${i}` })
				}

				const stored = hist.getAll()

				expect(stored).to.have.length(hist.STORED_LIMIT)

				hist.STORED_LIMIT = prev
			})
		})

		describe('searchHistory#getAll', function () {
			it('returns an empty array if a JSON parsing error occurs', function () {
				hist.add({query: 'doggos'})

				localStorage.setItem(TEST_KEY, 'lol')

				const stored = hist.getAll()

				expect(stored).to.be.an.array
				expect(stored).to.be.empty
			})
		})

		describe('searchHistory#getPreviousQueries', function () {
			it('returns the previous query-strings', function () {
				const searches = [
					{query: 'dogs'},
					{query: 'dogs'},
					{query: ''},
					{query: 'cats'},
					{query: 'frogs'}
				]

				// 2 birds 1 stone
				const queries = searches
					.map(s => {
						hist.add(s)
						return s.query
					})
					.filter((q, idx, arr) => q && (arr.indexOf(q) === idx))
					.reverse()

				expect(hist.getPreviousQueries()).to.deep.equal(queries)
			})
		})
	})
})
