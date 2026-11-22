/* Georgian overlay for the Settlement Simulator (owner direction 2026-11-22).
 * Active when the portal's `ast.locale` cookie is `ka` (or ?lang=ka). Rewrites
 * rendered text in place from an English→Georgian dictionary, so the
 * simulator code stays untouched. Scenario names, panel titles and brand
 * names are deliberately not in the dictionary and stay English.
 * shortcut: fragment substitution for text the code glues to values reads
 * less natural than a real i18n layer; upgrade if the simulator is rewritten. */
(function () {
  var on = /(?:^|; )ast\.locale=ka(?:;|$)/.test(document.cookie) || /[?&]lang=ka(?:&|$)/.test(location.search);
  if (!on) return;
  document.documentElement.lang = 'ka';

  var KA = {
    // navigation and controls
    'Choose another topic →': 'სხვა თემის არჩევა →',
    'Continue →': 'გაგრძელება →',
    'Next →': 'შემდეგი →',
    'Next': 'შემდეგი',
    'Next: how it runs today →': 'შემდეგ: როგორ მუშაობს დღეს →',
    'Show result →': 'შედეგის ჩვენება →',
    'Watch →': 'ყურება →',
    '← All topics': '← ყველა თემა',
    '← Edit my details': '← ჩემი მონაცემების რედაქტირება',
    '✓ Watched': '✓ ნანახია',
    'Watched:': 'ნანახია:',
    'Watched: Today': 'ნანახია: დღეს',
    'What do you want to watch?': 'რისი ნახვა გსურთ?',
    'Choose what to watch': 'აირჩიეთ, რას უყურებთ',
    'Pause': 'პაუზა',
    'Play': 'დაკვრა',
    'Replay': 'თავიდან ჩვენება',
    'Restart': 'თავიდან დაწყება',
    'Speed': 'სიჩქარე',
    'Legend': 'ლეგენდა',
    'Scenarios': 'სცენარები',
    'Your details': 'თქვენი მონაცემები',
    'Your details:': 'თქვენი მონაცემები:',
    'Names and amounts you enter appear in the animation.': 'თქვენ მიერ შეყვანილი სახელები და თანხები ანიმაციაში გამოჩნდება.',
    'Each topic is one institutional process. You enter your own details, then watch it run today and with AFC.':
      'ყოველი თემა ერთი ინსტიტუციური პროცესია. შეიყვანეთ თქვენი მონაცემები და ნახეთ, როგორ მიმდინარეობს ის დღეს და AFC-ით.',
    'Pick a topic, enter your own data, then watch the same process run today and with AFC.':
      'აირჩიეთ თემა, შეიყვანეთ თქვენი მონაცემები და ნახეთ ერთი და იგივე პროცესი დღეს და AFC-ით.',
    'How it runs now: every hand-off, hold and repeated check.': 'როგორ მუშაობს ახლა: ყოველი გადაცემა, დაბლოკვა და განმეორებითი შემოწმება.',
    'The same institutions connected through the AFC protocol layer.': 'იგივე ინსტიტუციები, დაკავშირებული AFC პროტოკოლის ფენით.',

    // groups and tags
    'All': 'ყველა',
    'Commercial': 'კომერციული',
    'Government': 'სახელმწიფო',
    'Capital markets': 'კაპიტალის ბაზრები',
    'Digital assets': 'ციფრული აქტივები',
    'Bank treasury': 'ბანკის ხაზინა',
    'Central bank money': 'ცენტრალური ბანკის ფული',
    'Today': 'დღეს',
    'With AFC': 'AFC-ით',
    'With AST': 'AST-ით',
    'Seconds to minutes': 'წამებიდან წუთებამდე',
    'Event sequence': 'მოვლენების თანმიმდევრობა',

    // scenario subtitles, form labels
    'SWIFT correspondent chain vs AFC': 'SWIFT კორესპონდენტული ჯაჭვი და AFC',
    'Paper title transfer vs AST': 'საკუთრების ქაღალდით გადაცემა და AST',
    'Bank-approved fiat payment to a crypto wallet': 'ბანკის მიერ დამტკიცებული ფიატ-გადახდა კრიპტოსაფულეზე',
    'GEL → KZT through the AFC process': 'GEL → KZT AFC პროცესით',
    'Amount': 'თანხა',
    'Valuation': 'შეფასება',
    'Valuation currency': 'შეფასების ვალუტა',
    'Your bank (sender)': 'თქვენი ბანკი (გამგზავნი)',
    'Beneficiary’s bank': 'ბენეფიციარის ბანკი',
    'Send in': 'გაგზავნის ვალუტა',
    'Paid out in': 'გაცემის ვალუტა',
    'paid out in': 'გაცემის ვალუტა',
    'Sending bank': 'გამგზავნი ბანკი',
    'Recipient wallet': 'მიმღების საფულე',
    'Sender': 'გამგზავნი',
    'Beneficiary': 'ბენეფიციარი',
    'Bank A': 'ბანკი A',
    'Bank B': 'ბანკი B',

    // metrics
    'Holds active': 'აქტიური დაბლოკვები',
    'Amount on hold now': 'ამჟამად დაბლოკილი თანხა',
    'Time on hold': 'დაბლოკვის დრო',
    'Messages': 'შეტყობინებები',
    'Paper documents': 'ქაღალდის დოკუმენტები',
    'API calls · PoT records': 'API გამოძახებები · PoT ჩანაწერები',
    'API calls': 'API გამოძახებები',
    'PoT records': 'PoT ჩანაწერები',
    'Fees & FX spread': 'საკომისიოები და კურსთაშორისი სხვაობა',
    'Elapsed (illustrative)': 'გასული დრო (საილუსტრაციო)',
    'Elapsed time and costs': 'გასული დრო და ხარჯები',
    'Cost and duration': 'ღირებულება და ხანგრძლივობა',
    'Peak amount on hold': 'მაქსიმალური დაბლოკილი თანხა',
    'Time with funds on hold': 'სახსრების დაბლოკვის დრო',
    'Messages & paper documents': 'შეტყობინებები და ქაღალდის დოკუმენტები',
    'Not estimated': 'არ არის შეფასებული',
    'Not measured': 'არ არის გაზომილი',
    'Outcome': 'შედეგი',
    'Stage': 'ეტაპი',
    'Stages': 'ეტაპები',
    'Stage sequence': 'ეტაპების თანმიმდევრობა',
    'Step': 'ნაბიჯი',
    'Steps': 'ნაბიჯები',
    'Current event': 'მიმდინარე მოვლენა',
    'Institutions in sequence': 'ინსტიტუციები თანმიმდევრობით',
    'Settlement route': 'ანგარიშსწორების მარშრუტი',
    '+ protocol fee': '+ პროტოკოლის საკომისიო',
    'protocol fee · tariff TBD': 'პროტოკოლის საკომისიო · ტარიფი დასაზუსტებელია',
    'set % of amount': 'თანხის დადგენილი %',
    'Done': 'დასრულდა',
    'Confirmed': 'დადასტურებულია',

    // diagram roles and stage labels
    'AFC PROTOCOL LAYER · LOGICAL API · NO ASSETS · NO CUSTODY': 'AFC პროტოკოლის ფენა · ლოგიკური API · აქტივების გარეშე · მეურვეობის გარეშე',
    'AFC · ARCHITECTURE VIEW': 'AFC · არქიტექტურის ხედი',
    'AFC · one pass': 'AFC · ერთი გავლა',
    'AFC routing': 'AFC მარშრუტიზაცია',
    'API GATEWAY': 'API კარიბჭე',
    'APP / API': 'აპი / API',
    'AST event': 'AST მოვლენა',
    'AST fee (ArosCoin)': 'AST საკომისიო (ArosCoin)',
    'AST issuance': 'AST გამოშვება',
    'AST · POT RECORD': 'AST · POT ჩანაწერი',
    'Accounts & liquidity': 'ანგარიშები და ლიკვიდობა',
    'Accounts / records check': 'ანგარიშების / ჩანაწერების შემოწმება',
    'Allocation': 'განაწილება',
    'Anchor': 'ანკერი',
    'Anchor · beneficiary': 'ანკერი · ბენეფიციარი',
    'Anchor · originator': 'ანკერი · ინიციატორი',
    'Approval': 'დამტკიცება',
    'Approved invoice': 'დამტკიცებული ინვოისი',
    'ArosCoin (PoT fee)': 'ArosCoin (PoT საკომისიო)',
    'Arrival': 'მიღება',
    'Asset owner': 'აქტივის მესაკუთრე',
    'Asset receipt': 'აქტივის მიღება',
    'Authority': 'უფლებამოსილი ორგანო',
    'Availability': 'ხელმისაწვდომობა',
    'Balances': 'ნაშთები',
    'Bank credit': 'საბანკო ჩარიცხვა',
    'Beneficiary verified': 'ბენეფიციარი გადამოწმებულია',
    'Beyond the wholesale CBDC perimeter': 'საბითუმო CBDC-ის პერიმეტრის მიღმა',
    'Blockchain': 'ბლოკჩეინი',
    'Bond position confirmed by custodian': 'ობლიგაციის პოზიცია დადასტურებულია მეურვის მიერ',
    'Book entries': 'საბუღალტრო ჩანაწერები',
    'Booking': 'გატარება',
    'Buyer of a share': 'წილის მყიდველი',
    'Buys crypto': 'ყიდულობს კრიპტოს',
    'CHF delivery': 'CHF-ის მიწოდება',
    'CHF deposit at the beneficiary bank': 'CHF დეპოზიტი ბენეფიციარის ბანკში',
    'CRYPTO EXCHANGE · BACKEND': 'კრიპტობირჟა · ბექენდი',
    'Card & bank rails': 'ბარათი/ბანკი',
    'Cash delivery': 'ნაღდი ფულის მიწოდება',
    'Checks passed.': 'შემოწმებები გავლილია.',
    'Checks run': 'შემოწმებები მიმდინარეობს',
    'Clearing initiated': 'კლირინგი დაიწყო',
    'Client': 'კლიენტი',
    'Completion evidence': 'დასრულების მტკიცებულება',
    'Completion signal': 'დასრულების სიგნალი',
    'Compliance check': 'შესაბამისობის შემოწმება',
    'Confirmed asset': 'დადასტურებული აქტივი',
    'Confirmed by participants': 'დადასტურებულია მონაწილეების მიერ',
    'Contract terms': 'ხელშეკრულების პირობები',
    'Conversion': 'კონვერტაცია',
    'Conversion wallet': 'საკონვერტაციო საფულე',
    'Correspondent': 'კორესპონდენტი',
    'Correspondent 1': 'კორესპონდენტი 1',
    'Correspondent 2': 'კორესპონდენტი 2',
    'Coupon': 'კუპონი',
    'Credit': 'ჩარიცხვა',
    'Credit ready': 'ჩარიცხვა მზადაა',
    'Crypto': 'კრიპტო',
    'Crypto anchor': 'კრიპტოანკერი',
    'Crypto asset': 'კრიპტოაქტივი',
    'Currency exchange': 'ვალუტის გაცვლა',
    'Custody': 'მეურვეობა',
    'Custody ledger': 'რეესტრი',
    'Deed & escrow': 'აქტი და ესქროუ',
    'Deed drafted': 'აქტი შედგენილია',
    'Delivery': 'მიწოდება',
    'Digital packages': 'ციფრული პაკეტები',
    'Eligibility': 'უფლებამოსილება',
    'Evidence': 'მტკიცებულება',
    'Exchange': 'ბირჟა',
    'Execution': 'შესრულება',
    'Executor': 'შემსრულებელი',
    'FX booking': 'სავალუტო გატარება',
    'FX executor': 'სავალუტო შემსრულებელი',
    'Fiat account': 'ფიატ-ანგარიში',
    'Fiat anchor': 'ფიატ-ანკერი',
    'Fiat leg': 'ფიატ-ნაწილი',
    'Funding': 'დაფინანსება',
    'GEL proceeds credited': 'GEL შემოსავალი ჩაირიცხა',
    'Identity': 'იდენტობა',
    'Institution': 'ინსტიტუცია',
    'Institutional client': 'ინსტიტუციური კლიენტი',
    'Instruction': 'ინსტრუქცია',
    'Intermediary': 'შუამავალი',
    'Intermediary · FX': 'შუამავალი · FX',
    'Investor': 'ინვესტორი',
    'Issuance': 'გამოშვება',
    'JPY available before the cutoff if timely': 'JPY ხელმისაწვდომია ბოლო ვადამდე, თუ დროულად მოხდა',
    'KYC & limits': 'KYC/ლიმიტი',
    'KYC/AML passed': 'KYC/AML გავლილია',
    'Liquidity': 'ლიკვიდობა',
    'Liquidity confirmed': 'ლიკვიდობა დადასტურებულია',
    'Local credit': 'ადგილობრივი ჩარიცხვა',
    'Local payment': 'ადგილობრივი გადახდა',
    'Loro rebalanced': 'Loro დაბალანსდა',
    'Mandate': 'მანდატი',
    'Marked: tokenized': 'მონიშნულია: ტოკენიზებული',
    'Match': 'დამთხვევა',
    'New owner registered': 'ახალი მესაკუთრე დარეგისტრირდა',
    'Nostro rebalanced': 'Nostro დაბალანსდა',
    'Notary': 'ნოტარიუსი',
    'Notice to': 'შეტყობინება:',
    'OUSG credited to the investor': 'OUSG ჩაერიცხა ინვესტორს',
    'On-chain': 'ჯაჭვზე',
    'Order': 'შეკვეთა',
    'Originator': 'ინიციატორი',
    'Other currencies': 'სხვა ვალუტები',
    'Paper document': 'ქაღალდის დოკუმენტი',
    'Parties identified': 'მხარეები იდენტიფიცირებულია',
    'Payment': 'გადახდა',
    'Payment mandate': 'საგადახდო მანდატი',
    'Payments': 'გადახდები',
    'Payout': 'გაცემა',
    'Proceeds': 'შემოსავალი',
    'Proof of transaction': 'ტრანზაქციის დადასტურება',
    'Public network': 'საჯარო ქსელი',
    'Public registry': 'საჯარო რეესტრი',
    'QES PACKAGE': 'QES პაკეტი',
    'QES verified': 'QES გადამოწმებულია',
    'Receipt': 'მიღება',
    'Reconciliation': 'შეჯერება',
    'Recorded in NodeChain': 'აღრიცხულია NodeChain-ში',
    'Redemption': 'გამოსყიდვა',
    'Request': 'მოთხოვნა',
    'SGD credit': 'SGD ჩარიცხვა',
    'SGD credited at the third bank': 'SGD ჩაირიცხა მესამე ბანკში',
    'SWIFT message': 'SWIFT შეტყობინება',
    'Sale': 'გაყიდვა',
    'Sale evidence': 'გაყიდვის მტკიცებულება',
    'Sanctions clear': 'სანქციური შემოწმება გავლილია',
    'Sender\'s bank': 'გამგზავნის ბანკი',
    'Settled on own books': 'გასწორდა საკუთარ ბალანსზე',
    'Settlement': 'ანგარიშსწორება',
    'Signal': 'სიგნალი',
    'Subscription': 'გამოწერა',
    'Supplier account credited': 'მომწოდებლის ანგარიშზე ჩაირიცხა',
    'TITLE PACK': 'საკუთრების პაკეტი',
    'Title history clear': 'საკუთრების ისტორია სუფთაა',
    'Title registry': 'საკუთრების რეესტრი',
    'Token before proof': 'ტოკენი დადასტურებამდე',
    'Tokenisation': 'ტოკენიზაცია',
    'Transfer': 'გადაცემა',
    'Treasury account credited': 'ხაზინის ანგარიშზე ჩაირიცხა',
    'USD credit on the bank statement': 'USD ჩარიცხვა საბანკო ამონაწერში',
    'USD settlement': 'USD ანგარიშსწორება',
    'USD transfer': 'USD გადარიცხვა',
    'Withdrawals': 'გატანა',

    // narration
    'A bank sends a fiat amount to one crypto wallet, delivered in the asset the request names. The baseline illustrates one exchange-funded withdrawal. With AFC, one process delivers it.':
      'ბანკი ფიატ-თანხას ერთ კრიპტოსაფულეზე აგზავნის და ის მოთხოვნაში მითითებული აქტივით მიეწოდება. საბაზისო მარშრუტი ბირჟის მიერ დაფინანსებულ ერთ გატანას აჩვენებს. AFC-ით მას ერთი პროცესი აწვდის.',
    'A batch is checked only when it reaches each beneficiary bank, after the money has left. A closed account turns into a return days later.':
      'პაკეტი მხოლოდ მაშინ მოწმდება, როცა ყოველ ბენეფიციარ ბანკს მიაღწევს — ფულის გასვლის შემდეგ. დახურული ანგარიში დღეების შემდეგ დაბრუნებად იქცევა.',
    'A corporate treasury funds its own SGD account at a third bank in Singapore from a US dollar account in the US.':
      'კორპორაციული ხაზინა საკუთარ SGD ანგარიშს სინგაპურის მესამე ბანკში აშშ-ში არსებული დოლარის ანგარიშიდან აფინანსებს.',
    'A foreign institution buys a CHF digital bond through an eligible settlement participant using funds held in another currency.':
      'უცხოური ინსტიტუცია CHF ციფრულ ობლიგაციას უფლებამოსილი ანგარიშსწორების მონაწილის მეშვეობით, სხვა ვალუტაში არსებული სახსრებით ყიდულობს.',
    'A funding authority approves a tranche after the programme authority verifies its conditions. Treasury needs confirmation of the credited amount.':
      'დამფინანსებელი ორგანო ტრანშს ამტკიცებს მას შემდეგ, რაც პროგრამის ორგანო მის პირობებს გადაამოწმებს. ხაზინას ჩარიცხული თანხის დადასტურება სჭირდება.',
    'A public buyer has approved an invoice for imported equipment. Compare delivery of the same EUR payment to the same supplier. Both tracks begin after acceptance of the goods. The USD funding amount depends on the executing institution’s quote.':
      'საჯარო შემსყიდველმა იმპორტირებული აღჭურვილობის ინვოისი დაამტკიცა. შეადარეთ ერთი და იმავე EUR გადახდის მიწოდება ერთსა და იმავე მომწოდებელზე. ორივე მარშრუტი საქონლის მიღების შემდეგ იწყება. USD დაფინანსების თანხა შემსრულებელი ინსტიტუციის კოტირებაზეა დამოკიდებული.',
    'A registry extract goes back to the notary.': 'რეესტრის ამონაწერი ნოტარიუსს უბრუნდება.',
    'A treasury holds native USDC on one network. Its chosen cash-out facility accepts the USDC on another. The mandate ends in USD at its own bank.':
      'ხაზინა ერთ ქსელზე ფლობს ნატიურ USDC-ს. მის მიერ არჩეული განაღდების სერვისი USDC-ს სხვა ქსელზე იღებს. მანდატი USD-ით სრულდება მისსავე ბანკში.',
    'AFC checks the arrived funds against the request.': 'AFC მიღებულ სახსრებს მოთხოვნასთან ადარებს.',
    'AFC coordinates one pass: each counterparty confirms its own account and liquidity at the same time.':
      'AFC ერთ გავლას კოორდინაციას უწევს: ყოველი კონტრაგენტი ერთდროულად ადასტურებს საკუთარ ანგარიშსა და ლიკვიდობას.',
    'AFC coordinates one pass: each counterparty confirms its own account, liquidity and FX quote at the same time.':
      'AFC ერთ გავლას კოორდინაციას უწევს: ყოველი კონტრაგენტი ერთდროულად ადასტურებს საკუთარ ანგარიშს, ლიკვიდობასა და სავალუტო კოტირებას.',
    'AFC processes the request and routes it to the': 'AFC ამუშავებს მოთხოვნას და მიმართავს მას:',
    'AFC routes the payout to the': 'AFC გაცემას მიმართავს:',
    'AFC routes the request to the fiat anchor.': 'AFC მოთხოვნას ფიატ-ანკერს მიმართავს.',
    'AFC routes the request to the fiat anchor. Once the USD funds are credited to its account, the confirmation returns to AFC.':
      'AFC მოთხოვნას ფიატ-ანკერს მიმართავს. როგორც კი USD სახსრები მის ანგარიშზე ჩაირიცხება, დადასტურება AFC-ს უბრუნდება.',
    'AFC sends the instruction to the crypto anchor.': 'AFC ინსტრუქციას კრიპტოანკერს უგზავნის.',
    'AFC starts AST on the confirmed amount and terms. Following completion it instructs the agreed SGD payout.':
      'AFC იწყებს AST-ს დადასტურებული თანხითა და პირობებით. დასრულების შემდეგ ის შეთანხმებულ SGD გაცემას ავალებს.',
    'AFC starts AST with the confirmed amount, data and conditions. AST records proof and issues ArosCoin under those terms.':
      'AFC იწყებს AST-ს დადასტურებული თანხით, მონაცემებითა და პირობებით. AST აღრიცხავს დადასტურებას და ამ პირობებით გამოსცემს ArosCoin-ს.',
    'AST records proof in NodeChain and issues ArosCoin under those terms.': 'AST დადასტურებას NodeChain-ში აღრიცხავს და ამ პირობებით გამოსცემს ArosCoin-ს.',
    'AST records the confirmed asset in NodeChain and issues ArosCoin according to the agreed equivalent. The tokenised position refers to this bond.':
      'AST დადასტურებულ აქტივს NodeChain-ში აღრიცხავს და შეთანხმებული ეკვივალენტით გამოსცემს ArosCoin-ს. ტოკენიზებული პოზიცია ამ ობლიგაციას ეხება.',
    'AST services the asset and records the confirmed change in the holder’s position, preserving the link to the underlying bond.':
      'AST აქტივს ემსახურება და მფლობელის პოზიციაში დადასტურებულ ცვლილებას აღრიცხავს, საფუძვლად არსებულ ობლიგაციასთან კავშირის შენარჩუნებით.',
    'AST signals completion to AFC.': 'AST AFC-ს დასრულების სიგნალს უგზავნის.',
    'AST signals completion to AFC. AFC routes the instruction for the EUR payment. This fiat route assumes an authorised EUR settlement arrangement.':
      'AST AFC-ს დასრულების სიგნალს უგზავნის. AFC EUR გადახდის ინსტრუქციას მიმართავს. ეს ფიატ-მარშრუტი EUR ანგარიშსწორების ავტორიზებულ შეთანხმებას გულისხმობს.',
    'AST verifies the signature and the documents (violet) and runs Proof of Transaction criteria P1–P4 (blue).':
      'AST ამოწმებს ხელმოწერასა და დოკუმენტებს (იისფერი) და ასრულებს Proof of Transaction-ის კრიტერიუმებს P1–P4 (ლურჯი).',
    'Acknowledgement goes back down the chain.': 'დადასტურება ჯაჭვით უკან ბრუნდება.',
    'After AST completion AFC coordinates CHF delivery to the eligible participant. Funding is distinct from bond delivery.':
      'AST-ის დასრულების შემდეგ AFC უფლებამოსილ მონაწილეზე CHF-ის მიწოდებას კოორდინაციას უწევს. დაფინანსება ობლიგაციის მიწოდებისგან განსხვავდება.',
    'After a settled transfer, the register updates the holders’ positions.': 'გასწორებული გადაცემის შემდეგ რეესტრი მფლობელების პოზიციებს აახლებს.',
    'After confirmed repayment at maturity, AST records the terminal event and ends servicing for the redeemed asset.':
      'დაფარვის ვადაზე დადასტურებული დაფარვის შემდეგ AST საბოლოო მოვლენას აღრიცხავს და გამოსყიდული აქტივის მომსახურებას ასრულებს.',
    'An eligible bank holds wholesale digital CHF in the Helvetia pilot and needs conventional CHF for a beneficiary outside the platform.':
      'უფლებამოსილი ბანკი Helvetia-ს პილოტში საბითუმო ციფრულ CHF-ს ფლობს და პლატფორმის გარეთ მყოფი ბენეფიციარისთვის ჩვეულებრივი CHF სჭირდება.',
    'An eligible investor redeems a position in a tokenised Treasury fund and needs the proceeds in a Georgian lari account.':
      'უფლებამოსილი ინვესტორი ტოკენიზებულ სახაზინო ფონდში პოზიციას გამოისყიდის და შემოსავალი ლარის ანგარიშზე სჭირდება.',
    'An eligible manager exchanges a BUIDL position on Ethereum for an OUSG position on Solana. Both tracks assume approved addresses and subscriptions.':
      'უფლებამოსილი მენეჯერი BUIDL პოზიციას Ethereum-ზე OUSG პოზიციაში ცვლის Solana-ზე. ორივე მარშრუტი დამტკიცებულ მისამართებსა და გამოწერებს გულისხმობს.',
    'An equipment importer instructs a cross-border supplier payment. Measure from bank approval to supplier account credit.':
      'აღჭურვილობის იმპორტიორი მომწოდებელზე ტრანსსასაზღვრო გადახდას ავალებს. იზომება ბანკის დამტკიცებიდან მომწოდებლის ანგარიშზე ჩარიცხვამდე.',
    'An institution sells a share of a real asset. Today the rights move on paper through a notary and a registry. With AST, a signed valuation passes Proof of Transaction and the rights live in NodeChain.':
      'ინსტიტუცია რეალური აქტივის წილს ყიდის. დღეს უფლებები ქაღალდზე, ნოტარიუსისა და რეესტრის გავლით გადადის. AST-ით ხელმოწერილი შეფასება Proof of Transaction-ს გადის და უფლებები NodeChain-ში ცოცხლობს.',
    'Anchors settle on their own books through the executor.': 'ანკერები საკუთარ ბალანსზე, შემსრულებლის მეშვეობით ასწორებენ ანგარიშს.',
    'Anchors settle on their own books. The executor converts': 'ანკერები საკუთარ ბალანსზე ასწორებენ ანგარიშს. შემსრულებელი აკონვერტირებს:',
    'ArosCoin moves to the': 'ArosCoin გადადის:',
    'ArosCoin reaches the designated conversion wallet and is exchanged for': 'ArosCoin დანიშნულ საკონვერტაციო საფულეს აღწევს და იცვლება:',
    'Asset tokens are minted strictly at the institutional price of': 'აქტივის ტოკენები მკაცრად ინსტიტუციური ფასით იმინტება:',
    'Assumes a supported CCIP lane, eligible redemption account and an agreed reverse AFC route.':
      'გულისხმობს მხარდაჭერილ CCIP არხს, გამოსყიდვის უფლებამოსილ ანგარიშსა და შეთანხმებულ საპირისპირო AFC მარშრუტს.',
    'BIS Figure 19 illustrates matched needs at one correspondent. An AFC route requires available JPY liquidity and an agreed quote. Margin payment is a later transaction.':
      'BIS-ის ფიგურა 19 ერთ კორესპონდენტთან შეთავსებულ საჭიროებებს ასახავს. AFC მარშრუტს ხელმისაწვდომი JPY ლიკვიდობა და შეთანხმებული კოტირება სჭირდება. მარჟის გადახდა მოგვიანებითი ტრანზაქციაა.',
    'CCIP delivers USDC. The crypto anchor confirms actual receipt for this mandate to AFC.':
      'CCIP აწვდის USDC-ს. კრიპტოანკერი AFC-ს ამ მანდატისთვის ფაქტობრივ მიღებას უდასტურებს.',
    'Confirmations build up. The transfer is treated as final only after several of them.':
      'დადასტურებები გროვდება. გადაცემა საბოლოოდ მხოლოდ რამდენიმე დადასტურების შემდეგ ითვლება.',
    'Confirmed GBP credit at the fiat anchor permits AFC to start AST and, on completion, direct the JPY payout.':
      'ფიატ-ანკერთან დადასტურებული GBP ჩარიცხვა AFC-ს AST-ის დაწყების ნებას აძლევს, დასრულებისას კი JPY გაცემის მიმართვისას.',
    'Confirmed fiat funding triggers AFC\'s request to AST. After AST completion AFC directs the agreed treasury payout.':
      'დადასტურებული ფიატ-დაფინანსება AFC-ის მოთხოვნას AST-ისადმი იწვევს. AST-ის დასრულების შემდეგ AFC შეთანხმებულ სახაზინო გაცემას მიმართავს.',
    'Correspondent 1 reserves liquidity against the payment. Two institutions now hold the same amount.':
      'კორესპონდენტი 1 გადახდისთვის ლიკვიდობას ბლოკავს. ახლა ერთსა და იმავე თანხას ორი ინსტიტუცია ფლობს.',
    'Correspondent 1 screens sanctions and fraud under its own rules and rebalances Nostro/Loro accounts.':
      'კორესპონდენტი 1 საკუთარი წესებით ამოწმებს სანქციებსა და თაღლითობას და Nostro/Loro ანგარიშებს აბალანსებს.',
    'Correspondent 2 checks compliance in its jurisdiction, rebalances Loro accounts and confirms liquidity.':
      'კორესპონდენტი 2 თავის იურისდიქციაში შესაბამისობას ამოწმებს, Loro ანგარიშებს აბალანსებს და ლიკვიდობას ადასტურებს.',
    'Correspondent 2 checks compliance in its jurisdiction, rebalances Loro accounts and quotes FX':
      'კორესპონდენტი 2 თავის იურისდიქციაში შესაბამისობას ამოწმებს, Loro ანგარიშებს აბალანსებს და სავალუტო კურსს აკოტირებს',
    'Correspondent 2 converts': 'კორესპონდენტი 2 აკონვერტირებს:',
    'Correspondent 2 reserves liquidity too. Three institutions now hold the same payment.':
      'კორესპონდენტი 2-იც ბლოკავს ლიკვიდობას. ახლა ერთსა და იმავე გადახდას სამი ინსტიტუცია ფლობს.',
    'Correspondent 2 takes its fee.': 'კორესპონდენტი 2 თავის საკომისიოს იღებს.',
    'DBS documents the bilateral USD leg. The FX and third-bank leg are model assumptions, as is AFC participation.':
      'DBS ორმხრივ USD ნაწილს ადოკუმენტირებს. სავალუტო და მესამე ბანკის ნაწილი, ისევე როგორც AFC-ის მონაწილეობა, მოდელის დაშვებებია.',
    'Delivered. The sender had to be checked by the bank, onboarded at the exchange, pass tiers, buy through the exchange’s own inventory, and withdraw with a travel-rule check before the crypto reached the wallet.':
      'მიწოდებულია. სანამ კრიპტო საფულეს მიაღწევდა, გამგზავნი ბანკს უნდა შეემოწმებინა, ბირჟაზე უნდა დარეგისტრირებულიყო, დონეები გაევლო, ბირჟის საკუთარი მარაგიდან ეყიდა და travel-rule შემოწმებით გაეტანა.',
    'Destination execution establishes delivery to the designated address on that chain.':
      'დანიშნულების ქსელში შესრულება ამ ჯაჭვზე დანიშნულ მისამართზე მიწოდებას ადასტურებს.',
    'Done. One signed package, one PoT verdict, tokens minted at the institutional price and a transfer recorded in NodeChain. No escrow held by AST.':
      'დასრულდა. ერთი ხელმოწერილი პაკეტი, ერთი PoT ვერდიქტი, ინსტიტუციური ფასით მინტილი ტოკენები და NodeChain-ში აღრიცხული გადაცემა. AST ესქროუს არ ფლობს.',
    'Done. Rights moved on paper through a notary and a registry, with the money in escrow the whole time. A resale starts the route again.':
      'დასრულდა. უფლებები ქაღალდზე, ნოტარიუსისა და რეესტრის გავლით გადავიდა, ფული კი მთელი ამ დროის განმავლობაში ესქროუში იყო. ხელახალი გაყიდვა მარშრუტს თავიდან იწყებს.',
    'Done. The funds were accepted on the fiat reserve, the transaction was confirmed, and only then ArosCoin was issued and paid out in the other currency.':
      'დასრულდა. სახსრები ფიატ-რეზერვზე მიიღეს, ტრანზაქცია დადასტურდა და მხოლოდ ამის შემდეგ გამოიცა ArosCoin და გაიცა სხვა ვალუტით.',
    'Each beneficiary bank confirms its own account before anything moves, so a bad account is caught up front and the employer sees it at once. Banks still credit their customers on their own books.':
      'ყოველი ბენეფიციარი ბანკი საკუთარ ანგარიშს მანამდე ადასტურებს, სანამ რამე გადაადგილდება, ამიტომ არასწორი ანგარიში წინასწარ ვლინდება და დამსაქმებელი მას მაშინვე ხედავს. ბანკები კლიენტებს კვლავ საკუთარ ბალანსზე ურიცხავენ.',
    'Each institution works from its own records and passes the case on by paper or message. Every hand-off adds a wait, a repeated check and a chance of error.':
      'ყოველი ინსტიტუცია საკუთარი ჩანაწერებით მუშაობს და საქმეს ქაღალდით ან შეტყობინებით გადასცემს. ყოველი გადაცემა ლოდინს, განმეორებით შემოწმებასა და შეცდომის შანსს ამატებს.',
    'Eligible holder sells BUIDL shares to Circle for USDC. The transfer changes ownership of the shares.':
      'უფლებამოსილი მფლობელი BUIDL წილებს Circle-ს USDC-ზე ყიდის. გადაცემა წილების საკუთრებას ცვლის.',
    'Fiat credit at the relevant anchor is confirmed to AFC before AST starts.': 'შესაბამის ანკერთან ფიატ-ჩარიცხვა AFC-ს AST-ის დაწყებამდე უდასტურდება.',
    'Follow one government bond from confirmed issuance through transfer, coupon and redemption. Both tracks end at maturity.':
      'მიჰყევით ერთ სახელმწიფო ობლიგაციას დადასტურებული გამოშვებიდან გადაცემის, კუპონისა და გამოსყიდვის გავლით. ორივე მარშრუტი დაფარვის ვადაზე სრულდება.',
    'Following AST completion AFC directs the agreed payout in the invoice currency.': 'AST-ის დასრულების შემდეგ AFC შეთანხმებულ გაცემას ინვოისის ვალუტით მიმართავს.',
    'Following fiat anchor account credit, the anchor signals AFC. The approved request alone cannot trigger issuance.':
      'ფიატ-ანკერის ანგარიშზე ჩარიცხვის შემდეგ ანკერი AFC-ს სიგნალს უგზავნის. მხოლოდ დამტკიცებული მოთხოვნა გამოშვებას ვერ იწყებს.',
    'Funds move down the chain.': 'სახსრები ჯაჭვით მოძრაობს.',
    'Funds move down the chain. Correspondent 1 takes its fee.': 'სახსრები ჯაჭვით მოძრაობს. კორესპონდენტი 1 თავის საკომისიოს იღებს.',
    'Funds travel hop by hop. Each intermediary holds them, screens the payment again and adds a fee, and the sender learns the outcome only when an acknowledgement travels all the way back.':
      'სახსრები ერთი რგოლიდან მეორეზე გადადის. ყოველი შუამავალი მათ ბლოკავს, გადახდას ხელახლა ამოწმებს და საკომისიოს ამატებს, გამგზავნი კი შედეგს მხოლოდ მაშინ იგებს, როცა დადასტურება მთელ გზას უკან გაივლის.',
    'Helvetia is a pilot. Exit to a conventional balance and the onward bank payment are modelled subject to the operator\'s rules. No AFC access to wholesale CBDC is assumed.':
      'Helvetia პილოტია. ჩვეულებრივ ნაშთზე გასვლა და შემდგომი საბანკო გადახდა ოპერატორის წესების გათვალისწინებითაა მოდელირებული. AFC-ის წვდომა საბითუმო CBDC-ზე არ იგულისხმება.',
    'In this proposed reverse route AFC requests AST issuance against the confirmed asset and receives the completion signal.':
      'ამ შემოთავაზებულ საპირისპირო მარშრუტში AFC დადასტურებული აქტივის საფუძველზე AST-ისგან გამოშვებას ითხოვს და დასრულების სიგნალს იღებს.',
    'KYC tier 1: full name, date of birth and a photo of the ID document, matched to a selfie.':
      'KYC დონე 1: სრული სახელი, დაბადების თარიღი და პირადობის დოკუმენტის ფოტო, სელფისთან შედარებით.',
    'On that confirmation, AFC starts AST with the transaction amount, data and terms.': 'ამ დადასტურებით AFC იწყებს AST-ს ტრანზაქციის თანხით, მონაცემებითა და პირობებით.',
    'Ondo confirms the OUSG allocation. Until then the portfolio change is incomplete, even if the cash arrived.':
      'Ondo OUSG-ის განაწილებას ადასტურებს. მანამდე პორტფელის ცვლილება დაუსრულებელია, თუნდაც ფული მოსული იყოს.',
    'Ondo documented a specific USD redemption to Singapore. The extension to GEL and the AFC arrangements are modelled.':
      'Ondo-მ სინგაპურში კონკრეტული USD გამოსყიდვა დაადოკუმენტა. GEL-ზე გავრცელება და AFC-ის შეთანხმებები მოდელირებულია.',
    'Ondo receives funds and applies its subscription terms. A failed subscription leaves a cash position.':
      'Ondo სახსრებს იღებს და გამოწერის პირობებს იყენებს. წარუმატებელი გამოწერა ფულად პოზიციას ტოვებს.',
    'One bank requests JPY against surplus GBP. A second bank requests GBP against JPY.':
      'ერთი ბანკი ჭარბი GBP-ის სანაცვლოდ JPY-ს ითხოვს. მეორე ბანკი JPY-ის სანაცვლოდ GBP-ს ითხოვს.',
    'One combined confirmation: contract terms, accounts, liquidity and FX quote, each attested by its owner.':
      'ერთი გაერთიანებული დადასტურება: ხელშეკრულების პირობები, ანგარიშები, ლიკვიდობა და სავალუტო კოტირება — თითოეული მისი მფლობელის მიერ დადასტურებული.',
    'One payment, two routes. First the correspondent chain banks use today, then the same institutions connected through the AFC protocol layer.':
      'ერთი გადახდა, ორი მარშრუტი. ჯერ კორესპონდენტული ჯაჭვი, რომელსაც ბანკები დღეს იყენებენ, შემდეგ იგივე ინსტიტუციები, დაკავშირებული AFC პროტოკოლის ფენით.',
    'Only credited fiat funding confirmed to AFC starts AST. After AST completion AFC instructs the agreed payout.':
      'AST-ს მხოლოდ AFC-სთვის დადასტურებული ჩარიცხული ფიატ-დაფინანსება იწყებს. AST-ის დასრულების შემდეგ AFC შეთანხმებულ გაცემას ავალებს.',
    'Paper documents go to a notary: valuation report, title deeds, corporate approvals.':
      'ქაღალდის დოკუმენტები ნოტარიუსთან მიდის: შეფასების ანგარიში, საკუთრების დოკუმენტები, კორპორაციული თანხმობები.',
    'PoT confirms the valuation was provided. NodeChain records the creation of the asset token.':
      'PoT ადასტურებს, რომ შეფასება წარდგენილია. NodeChain აქტივის ტოკენის შექმნას აღრიცხავს.',
    'Principal is repaid at maturity. The register records redemption and closes the position.':
      'ძირითადი თანხა დაფარვის ვადაზე იფარება. რეესტრი გამოსყიდვას აღრიცხავს და პოზიციას ხურავს.',
    'Proof of Transaction: NodeChain (AST) records the verified execution. The AST fee is settled post-factum under the Canon.':
      'Proof of Transaction: NodeChain (AST) გადამოწმებულ შესრულებას აღრიცხავს. AST-ის საკომისიო კანონის მიხედვით, post-factum სწორდება.',
    'Proof of transaction goes to NodeChain (AST). No token exists before this point.': 'ტრანზაქციის დადასტურება NodeChain-ში (AST) მიდის. ამ მომენტამდე ტოკენი არ არსებობს.',
    'Proof of transaction reaches NodeChain (AST).': 'ტრანზაქციის დადასტურება NodeChain-ს (AST) აღწევს.',
    'Public buyer verifies the signed acceptance, supplier and EUR invoice amount.': 'საჯარო შემსყიდველი ამოწმებს ხელმოწერილ მიღებას, მომწოდებელსა და EUR ინვოისის თანხას.',
    'Reference: Hong Kong’s HKD 800 million tokenised government green bond. HKMA documents issuance, settlement, coupon and redemption. The AST route is an illustrative design and assumes authorised access to issuer and registry confirmations.':
      'მითითება: ჰონგ-კონგის 800 მილიონი HKD-ის ტოკენიზებული სახელმწიფო მწვანე ობლიგაცია. HKMA ადოკუმენტირებს გამოშვებას, ანგარიშსწორებას, კუპონსა და გამოსყიდვას. AST მარშრუტი საილუსტრაციო დიზაინია და ემიტენტისა და რეესტრის დადასტურებებზე ავტორიზებულ წვდომას გულისხმობს.',
    'Registration: e-mail, phone, password and a two-factor code. The account exists but cannot buy yet.':
      'რეგისტრაცია: ელფოსტა, ტელეფონი, პაროლი და ორფაქტორიანი კოდი. ანგარიში არსებობს, მაგრამ ყიდვა ჯერ არ შეუძლია.',
    'Sanctions and PEP screening of the sender. Each check is run again at every new tier.':
      'გამგზავნის სანქციური და PEP შემოწმება. ყოველი შემოწმება ყოველ ახალ დონეზე თავიდან სრულდება.',
    'Settled. No intermediary holds and no acknowledgement wave. Each institution checked once, at the same time, and NodeChain holds the proof.':
      'გასწორდა. არც შუამავლების დაბლოკვები და არც დადასტურებების ტალღა. ყოველმა ინსტიტუციამ ერთხელ, ერთდროულად შეამოწმა, დადასტურებას კი NodeChain ინახავს.',
    'Settled. The payment waited on each institution in turn, and every hop added a message and a hold.':
      'გასწორდა. გადახდა რიგრიგობით ელოდა ყოველ ინსტიტუციას, ყოველმა რგოლმა კი შეტყობინება და დაბლოკვა დაამატა.',
    'Settled. Three institutions held the same funds for most of the route, and every hop added a message, a check and a fee.':
      'გასწორდა. მარშრუტის უდიდეს ნაწილში ერთსა და იმავე სახსრებს სამი ინსტიტუცია ფლობდა, ყოველმა რგოლმა კი შეტყობინება, შემოწმება და საკომისიო დაამატა.',
    'Settlement is scheduled. The card amount reaches the exchange’s bank later, often a day or more.':
      'ანგარიშსწორება დაგეგმილია. ბარათის თანხა ბირჟის ბანკს მოგვიანებით აღწევს, ხშირად დღის ან მეტის შემდეგ.',
    'Swift reports network-wide distributions. The sequence illustrates a corridor and assumes an authorised payout arrangement.':
      'Swift მთელი ქსელის განაწილებებს აქვეყნებს. თანმიმდევრობა ერთ დერეფანს ასახავს და გაცემის ავტორიზებულ შეთანხმებას გულისხმობს.',
    'The AST fee is charged in ArosCoin under the Canon formula (amount × fee rate).': 'AST-ის საკომისიო ArosCoin-ით, კანონის ფორმულით (თანხა × საკომისიოს განაკვეთი) ირიცხება.',
    'The Circle exit is a secondary sale. Ondo decides eligibility and issuance. The combined route is illustrative.':
      'Circle-ით გასვლა მეორადი გაყიდვაა. უფლებამოსილებასა და გამოშვებას Ondo წყვეტს. გაერთიანებული მარშრუტი საილუსტრაციოა.',
    'The EU facility illustrates conditional approval. The payment corridor and receiving currency are illustrative.':
      'ევროკავშირის მექანიზმი პირობით დამტკიცებას ასახავს. საგადახდო დერეფანი და მიმღები ვალუტა საილუსტრაციოა.',
    'The IBRD digital CHF issue is documented. Foreign funding, participant access and AFC settlement arrangements are illustrative.':
      'IBRD-ის ციფრული CHF გამოშვება დოკუმენტირებულია. უცხოური დაფინანსება, მონაწილეთა წვდომა და AFC-ის ანგარიშსწორების შეთანხმებები საილუსტრაციოა.',
    'The World Bank Disbursement Handbook documents direct payments to contractors at a borrower’s request. This fictional currency corridor illustrates that purchasing need. Participation, permissions, rates and costs require actual agreements.':
      'მსოფლიო ბანკის გადარიცხვების სახელმძღვანელო მსესხებლის მოთხოვნით კონტრაქტორებზე პირდაპირ გადახდებს აღწერს. ეს გამოგონილი სავალუტო დერეფანი ამ შესყიდვის საჭიროებას ასახავს. მონაწილეობას, ნებართვებს, კურსებსა და ხარჯებს რეალური შეთანხმებები სჭირდება.',
    'The account bank books the incoming dollars. A wire reference alone does not complete this mandate.':
      'ანგარიშის ბანკი შემოსულ დოლარებს ატარებს. მხოლოდ გადარიცხვის რეფერენსი ამ მანდატს ვერ ასრულებს.',
    'The account bank confirms the GEL credit and the investor reconciles it to the redemption.':
      'ანგარიშის ბანკი GEL ჩარიცხვას ადასტურებს, ინვესტორი კი მას გამოსყიდვასთან აჯერებს.',
    'The account credit is confirmed to AFC.': 'ანგარიშზე ჩარიცხვა AFC-ს უდასტურდება.',
    'The acknowledgement reaches Correspondent 1. Its hold is released.': 'დადასტურება კორესპონდენტ 1-ს აღწევს. მისი დაბლოკვა იხსნება.',
    'The authorised bank confirms the GEL deposit. The fund retains control over its share register.':
      'ავტორიზებული ბანკი GEL დეპოზიტს ადასტურებს. ფონდი წილების რეესტრზე კონტროლს ინარჩუნებს.',
    'The authorised fiat payout is executed and the account bank confirms USD credit. Participants receive their own results.':
      'ავტორიზებული ფიატ-გაცემა სრულდება და ანგარიშის ბანკი USD ჩარიცხვას ადასტურებს. მონაწილეები საკუთარ შედეგებს იღებენ.',
    'The authorised holder requests redemption. The fund applies its terms and confirms the proceeds.':
      'ავტორიზებული მფლობელი გამოსყიდვას ითხოვს. ფონდი თავის პირობებს იყენებს და შემოსავალს ადასტურებს.',
    'The authorised institution approves a CHF funding mandate to AFC. Fiat account credit is confirmed before AST issuance.':
      'ავტორიზებული ინსტიტუცია AFC-სთვის CHF დაფინანსების მანდატს ამტკიცებს. ფიატ-ანგარიშზე ჩარიცხვა AST-ის გამოშვებამდე დასტურდება.',
    'The authorised institution verifies amount and beneficiary and submits its approved mandate to AFC.':
      'ავტორიზებული ინსტიტუცია ამოწმებს თანხასა და ბენეფიციარს და დამტკიცებულ მანდატს AFC-ს წარუდგენს.',
    'The authorised institution verifies the supplier’s bank instructions and approves payment.':
      'ავტორიზებული ინსტიტუცია მომწოდებლის საბანკო ინსტრუქციებს ამოწმებს და გადახდას ამტკიცებს.',
    'The authorised issuer records the resulting OUSG position at the approved address.': 'ავტორიზებული ემიტენტი მიღებულ OUSG პოზიციას დამტკიცებულ მისამართზე აღრიცხავს.',
    'The authorised register records the institutional holder’s position.': 'ავტორიზებული რეესტრი ინსტიტუციური მფლობელის პოზიციას აღრიცხავს.',
    'The authorised sale facility executes the sale. Its receipt establishes the available proceeds.':
      'ავტორიზებული გაყიდვის სერვისი გაყიდვას ასრულებს. მისი ქვითარი ხელმისაწვდომ შემოსავალს ადგენს.',
    'The bank approves a request for the required JPY balance and specifies its settlement deadline to AFC.':
      'ბანკი საჭირო JPY ნაშთის მოთხოვნას ამტკიცებს და AFC-ს ანგარიშსწორების ბოლო ვადას უთითებს.',
    'The bank approves delivery of conventional CHF and sends the payment request to AFC.': 'ბანკი ჩვეულებრივი CHF-ის მიწოდებას ამტკიცებს და საგადახდო მოთხოვნას AFC-ს უგზავნის.',
    'The bank approves its client\'s withdrawal mandate and sends it only to AFC.': 'ბანკი კლიენტის გატანის მანდატს ამტკიცებს და მხოლოდ AFC-ს უგზავნის.',
    'The bank checks the card: one-time code (3-D Secure), available balance and fraud score.':
      'ბანკი ბარათს ამოწმებს: ერთჯერადი კოდი (3-D Secure), ხელმისაწვდომი ნაშთი და თაღლითობის რისკის ქულა.',
    'The bank checks the customer: identity, login, one-time code, daily limit, sanctions and AML screening.':
      'ბანკი კლიენტს ამოწმებს: იდენტობა, შესვლა, ერთჯერადი კოდი, დღიური ლიმიტი, სანქციური და AML შემოწმება.',
    'The bank compares the JPY posting time with the deadline. Capital saved and timing advantage are unmeasured.':
      'ბანკი JPY-ის გატარების დროს ბოლო ვადას ადარებს. დაზოგილი კაპიტალი და დროითი უპირატესობა გაზომილი არ არის.',
    'The bank initiates the onward CHF payment using its conventional payment arrangements.': 'ბანკი შემდგომ CHF გადახდას ჩვეულებრივი საგადახდო შეთანხმებებით იწყებს.',
    'The bank performs the same checks and submits the approved mandate to AFC.': 'ბანკი იგივე შემოწმებებს ასრულებს და დამტკიცებულ მანდატს AFC-ს წარუდგენს.',
    'The bank verifies available JPY against the local deadline. The margin payment is still outstanding.':
      'ბანკი ხელმისაწვდომ JPY-ს ადგილობრივ ბოლო ვადასთან ამოწმებს. მარჟის გადახდა ჯერ კიდევ შესასრულებელია.',
    'The beneficiary bank confirms the CHF deposit. Whether AFC adds value on this corridor requires measurement.':
      'ბენეფიციარის ბანკი CHF დეპოზიტს ადასტურებს. მატებს თუ არა AFC ამ დერეფანში ღირებულებას, გაზომვას საჭიროებს.',
    'The buyer matches the bank confirmation against the invoice and contract milestone.': 'შემსყიდველი საბანკო დადასტურებას ინვოისსა და ხელშეკრულების ეტაპს ადარებს.',
    'The card settles with the exchange’s bank, one or more days after the authorisation.': 'ბარათი ბირჟის ბანკთან ავტორიზაციიდან ერთი ან მეტი დღის შემდეგ სწორდება.',
    'The cash settlement provider delivers USD using the agreed banking instructions.': 'ფულადი ანგარიშსწორების პროვაიდერი USD-ს შეთანხმებული საბანკო ინსტრუქციებით აწვდის.',
    'The client’s funds are released.': 'კლიენტის სახსრები განიბლოკა.',
    'The common correspondent checks both balances, the FX exposure and remaining time.': 'საერთო კორესპონდენტი ამოწმებს ორივე ნაშთს, სავალუტო რისკსა და დარჩენილ დროს.',
    'The correspondent releases its hold.': 'კორესპონდენტი დაბლოკვას ხსნის.',
    'The correspondent reserves liquidity. Two institutions now hold the same amount.': 'კორესპონდენტი ლიკვიდობას ბლოკავს. ახლა ერთსა და იმავე თანხას ორი ინსტიტუცია ფლობს.',
    'The correspondent screens the payment and rebalances its own accounts.': 'კორესპონდენტი გადახდას ამოწმებს და საკუთარ ანგარიშებს აბალანსებს.',
    'The custodian confirms the investor\'s position after securities settlement.': 'მეურვე ფასიანი ქაღალდების ანგარიშსწორების შემდეგ ინვესტორის პოზიციას ადასტურებს.',
    'The eligible client moves USD between supported Kinexys and DBS accounts.': 'უფლებამოსილი კლიენტი USD-ს მხარდაჭერილ Kinexys-ისა და DBS-ის ანგარიშებს შორის გადაადგილებს.',
    'The eligible institution redeems USDC with its provider and requests a USD wire to its linked account.':
      'უფლებამოსილი ინსტიტუცია USDC-ს თავის პროვაიდერთან გამოისყიდის და დაკავშირებულ ანგარიშზე USD გადარიცხვას ითხოვს.',
    'The eligible participant handles the same pilot conversion under the operator\'s rules.': 'უფლებამოსილი მონაწილე იმავე საპილოტე კონვერტაციას ოპერატორის წესებით ასრულებს.',
    'The eligible participant settles the bond purchase under the venue rules.': 'უფლებამოსილი მონაწილე ობლიგაციის შესყიდვას სავაჭრო პლატფორმის წესებით ასწორებს.',
    'The eligible participant uses the permitted central-bank procedure and reconciles the conventional CHF balance.':
      'უფლებამოსილი მონაწილე ცენტრალური ბანკის ნებადართულ პროცედურას იყენებს და ჩვეულებრივ CHF ნაშთს აჯერებს.',
    'The exchange signs the transfer from its own hot wallet and broadcasts it.': 'ბირჟა გადაცემას საკუთარი ცხელი საფულიდან ხელს აწერს და ქსელში აგზავნის.',
    'The executing bank quotes the USD funding required to deliver the invoiced EUR amount.': 'შემსრულებელი ბანკი ინვოისის EUR თანხის მისაწოდებლად საჭირო USD დაფინანსებას აკოტირებს.',
    'The executing institution releases funds by the agreed banking route.': 'შემსრულებელი ინსტიტუცია სახსრებს შეთანხმებული საბანკო მარშრუტით გასცემს.',
    'The fiat anchor confirms actual funding to AFC. AST completes on those terms before AFC directs the GEL payout.':
      'ფიატ-ანკერი AFC-ს ფაქტობრივ დაფინანსებას უდასტურებს. AST ამ პირობებით სრულდება, სანამ AFC GEL გაცემას მიმართავს.',
    'The fiat credit triggers AST through AFC. AST completion returns to AFC before the crypto anchor is instructed.':
      'ფიატ-ჩარიცხვა AFC-ის მეშვეობით AST-ს იწყებს. AST-ის დასრულება AFC-ს უბრუნდება, სანამ კრიპტოანკერი ინსტრუქციას მიიღებს.',
    'The fiat credit was confirmed to AFC. AST completed issuance and signalled AFC. Following the crypto-anchor instruction and wallet conversion':
      'ფიატ-ჩარიცხვა AFC-ს დაუდასტურდა. AST-მა გამოშვება დაასრულა და AFC-ს სიგნალი გაუგზავნა. კრიპტოანკერის ინსტრუქციისა და საფულის კონვერტაციის შემდეგ',
    'The fund processes the redemption through its own interface and determines the payable proceeds.':
      'ფონდი გამოსყიდვას საკუთარი ინტერფეისით ამუშავებს და გასაცემ შემოსავალს ადგენს.',
    'The funding authority authorises that tranche and provides the receiving treasury account details.':
      'დამფინანსებელი ორგანო ამ ტრანშს ავტორიზებას უკეთებს და მიმღები ხაზინის ანგარიშის რეკვიზიტებს აწვდის.',
    'The gateway delivers the request to AFC, first.': 'კარიბჭე მოთხოვნას პირველ რიგში AFC-ს აწვდის.',
    'The guarantee is real, but the proof is paper. Documents are couriered and examined twice, so the importer’s funds stay blocked for as long as the paper takes.':
      'გარანტია რეალურია, მაგრამ დადასტურება ქაღალდია. დოკუმენტები კურიერით იგზავნება და ორჯერ მოწმდება, ამიტომ იმპორტიორის სახსრები იმდენ ხანს რჩება დაბლოკილი, რამდენ ხანსაც ქაღალდს სჭირდება.',
    'The institution submits one digital package with a qualified electronic signature (QES).': 'ინსტიტუცია ერთ ციფრულ პაკეტს კვალიფიციური ელექტრონული ხელმოწერით (QES) წარადგენს.',
    'The investor appears and pays into the notary’s escrow account.': 'ინვესტორი ჩნდება და ნოტარიუსის ესქროუ ანგარიშზე იხდის.',
    'The investor pays into the notary’s escrow account.': 'ინვესტორი ნოტარიუსის ესქროუ ანგარიშზე იხდის.',
    'The investor receives a paper certificate. Every later transfer repeats this route.': 'ინვესტორი ქაღალდის სერტიფიკატს იღებს. ყოველი შემდგომი გადაცემა ამ მარშრუტს იმეორებს.',
    'The investor receives an allocation and settlement instructions from the authorised participants.': 'ინვესტორი ავტორიზებული მონაწილეებისგან განაწილებასა და ანგარიშსწორების ინსტრუქციებს იღებს.',
    'The investor\'s bank converts available USD at the agreed USD/GEL quote.': 'ინვესტორის ბანკი ხელმისაწვდომ USD-ს შეთანხმებული USD/GEL კოტირებით აკონვერტირებს.',
    'The investor\'s bank converts available currency to CHF and funds the designated participant account.':
      'ინვესტორის ბანკი ხელმისაწვდომ ვალუტას CHF-ში აკონვერტირებს და დანიშნული მონაწილის ანგარიშს აფინანსებს.',
    'The issuer establishes the bond terms, nominal amount and maturity.': 'ემიტენტი ადგენს ობლიგაციის პირობებს, ნომინალურ თანხასა და დაფარვის ვადას.',
    'The issuer provides evidence of the institutional bond, its terms, valuation and authoritative record.':
      'ემიტენტი წარადგენს ინსტიტუციური ობლიგაციის, მისი პირობების, შეფასებისა და ოფიციალური ჩანაწერის მტკიცებულებას.',
    'The ledger credits the sender’s account with': 'რეესტრი გამგზავნის ანგარიშზე რიცხავს:',
    'The liquidity provider quotes its price for the order at this moment. The exchange accepts the quote.':
      'ლიკვიდობის პროვაიდერი შეკვეთისთვის ამ მომენტის ფასს აკოტირებს. ბირჟა კოტირებას იღებს.',
    'The manager approves exit and subscription terms and submits the combined mandate to AFC.': 'მენეჯერი გასვლისა და გამოწერის პირობებს ამტკიცებს და გაერთიანებულ მანდატს AFC-ს წარუდგენს.',
    'The manager identifies the received USDC and arranges delivery on the subscription network.': 'მენეჯერი მიღებულ USDC-ს იდენტიფიცირებს და გამოწერის ქსელზე მიწოდებას აწყობს.',
    'The manager verifies redemption eligibility and approves delivery of the proceeds into the specified GEL account.':
      'მენეჯერი გამოსყიდვის უფლებამოსილებას ამოწმებს და შემოსავლის მითითებულ GEL ანგარიშზე მიწოდებას ამტკიცებს.',
    'The message, now carrying two stamps, moves on to Correspondent 2.': 'შეტყობინება, უკვე ორი შტამპით, კორესპონდენტ 2-თან გადადის.',
    'The money sits in escrow until the registry confirms the new title.': 'ფული ესქროუში რჩება, სანამ რეესტრი ახალ საკუთრებას არ დაადასტურებს.',
    'The network fee and the exchange’s withdrawal fee come out of the balance.': 'ქსელის საკომისიო და ბირჟის გატანის საკომისიო ნაშთიდან იქვითება.',
    'The notary drafts the deed of transfer.': 'ნოტარიუსი გადაცემის აქტს ადგენს.',
    'The notary files the deed with the title registry.': 'ნოტარიუსი აქტს საკუთრების რეესტრში წარადგენს.',
    'The notary verifies identities and authority (violet) and checks the documents against each other (blue).':
      'ნოტარიუსი ამოწმებს იდენტობებსა და უფლებამოსილებას (იისფერი) და დოკუმენტებს ერთმანეთს ადარებს (ლურჯი).',
    'The originating bank approves the request for SGD delivery and submits it to AFC.': 'ინიციატორი ბანკი SGD მიწოდების მოთხოვნას ამტკიცებს და AFC-ს წარუდგენს.',
    'The owner receives the purchase price.': 'მესაკუთრე ნასყიდობის ფასს იღებს.',
    'The paid order goes to the liquidity desk: buy crypto for the sender.': 'გადახდილი შეკვეთა ლიკვიდობის დესკზე მიდის: გამგზავნისთვის კრიპტოს ყიდვა.',
    'The participant verifies eligibility and obtains instructions for converting its pilot balance to conventional funds.':
      'მონაწილე უფლებამოსილებას ამოწმებს და საპილოტე ნაშთის ჩვეულებრივ სახსრებად კონვერტაციის ინსტრუქციებს იღებს.',
    'The paying agent confirms the coupon event. AST links that event to the serviced asset and the relevant position.':
      'საგადახდო აგენტი კუპონის მოვლენას ადასტურებს. AST ამ მოვლენას მომსახურე აქტივსა და შესაბამის პოზიციას უკავშირებს.',
    'The paying agent uses the applicable record date and confirms the coupon payment.': 'საგადახდო აგენტი შესაბამის აღრიცხვის თარიღს იყენებს და კუპონის გადახდას ადასტურებს.',
    'The paying bank instructs an SGD payment to the third bank using the verified account details.': 'გადამხდელი ბანკი მესამე ბანკზე SGD გადახდას გადამოწმებული რეკვიზიტებით ავალებს.',
    'The payment processor checks the merchant, the fraud rules and the currency. The purchase is authorised, not settled.':
      'საგადახდო პროცესორი ამოწმებს მერჩანტს, თაღლითობის წესებსა და ვალუტას. შესყიდვა ავტორიზებულია, მაგრამ არა გასწორებული.',
    'The payment reaches the beneficiary institution. This event establishes arrival at the bank.': 'გადახდა ბენეფიციარ ინსტიტუციას აღწევს. ეს მოვლენა ბანკში მიღებას ადასტურებს.',
    'The posting is matched to the invoice reference. Arrival time and customer credit time can now be compared.':
      'გატარება ინვოისის რეფერენსს ედარება. ახლა შეიძლება მიღებისა და კლიენტზე ჩარიცხვის დროის შედარება.',
    'The programme authority assesses the agreed milestones and documents the amount eligible for release.':
      'პროგრამის ორგანო შეთანხმებულ ეტაპებს აფასებს და გასაცემად დასაშვებ თანხას ადოკუმენტირებს.',
    'The programme authority verifies the same milestones. Its decision remains the basis of the release.':
      'პროგრამის ორგანო იმავე ეტაპებს ამოწმებს. მისი გადაწყვეტილება გაცემის საფუძვლად რჩება.',
    'The proposed route requires an authorised JPY provider, adequate liquidity and a rate acceptable to the bank.':
      'შემოთავაზებულ მარშრუტს ავტორიზებული JPY პროვაიდერი, საკმარისი ლიკვიდობა და ბანკისთვის მისაღები კურსი სჭირდება.',
    'The purchase order reaches the card and bank rails.': 'შესყიდვის შეკვეთა ბარათისა და საბანკო რელსებს აღწევს.',
    'The receiving bank completes its applicable checks and posts the supplier credit.': 'მიმღები ბანკი შესაბამის შემოწმებებს ასრულებს და მომწოდებელზე ჩარიცხვას ატარებს.',
    'The receiving bank credits the beneficiary deposit. Its liability is distinct from central bank money.':
      'მიმღები ბანკი ბენეფიციარის დეპოზიტზე რიცხავს. მისი ვალდებულება ცენტრალური ბანკის ფულისგან განსხვავდება.',
    'The recipient bank credits the approved supplier.': 'მიმღები ბანკი დამტკიცებულ მომწოდებელს ურიცხავს.',
    'The recipient details are on file. The withdrawal is accepted.': 'მიმღების მონაცემები შენახულია. გატანა მიღებულია.',
    'The registry checks title history, encumbrances and fees. Queues are measured in days or weeks.':
      'რეესტრი ამოწმებს საკუთრების ისტორიას, დატვირთვებსა და მოსაკრებლებს. რიგები დღეებით ან კვირებით იზომება.',
    'The registry records the new co-owner.': 'რეესტრი ახალ თანამესაკუთრეს აღრიცხავს.',
    'The request and the funds reach the AFC gateway together.': 'მოთხოვნა და სახსრები AFC კარიბჭეს ერთად აღწევს.',
    'The same acceptance and supplier checks are complete. The institution submits the EUR payment request only to AFC.':
      'მიღებისა და მომწოდებლის იგივე შემოწმებები დასრულებულია. ინსტიტუცია EUR საგადახდო მოთხოვნას მხოლოდ AFC-ს წარუდგენს.',
    'The same allocation and settlement instructions define how much CHF is required and by when.':
      'იგივე განაწილება და ანგარიშსწორების ინსტრუქციები განსაზღვრავს, რამდენი CHF არის საჭირო და რა ვადაში.',
    'The sender is told the transfer is complete. From here only the recipient controls the wallet.':
      'გამგზავნს ეცნობება, რომ გადაცემა დასრულდა. ამიერიდან საფულეს მხოლოდ მიმღები აკონტროლებს.',
    'The sender leaves the bank and opens the exchange app.': 'გამგზავნი ბანკს ტოვებს და ბირჟის აპს ხსნის.',
    'The sending bank approves the invoice payment and validates the beneficiary instructions.': 'გამგზავნი ბანკი ინვოისის გადახდას ამტკიცებს და ბენეფიციარის ინსტრუქციებს ამოწმებს.',
    'The supplier bank confirms the credited amount and invoice reference. This is the same end point as Today.':
      'მომწოდებლის ბანკი ჩარიცხულ თანხასა და ინვოისის რეფერენსს ადასტურებს. ეს იგივე საბოლოო წერტილია, რაც „დღეს“.',
    'The supplier receives the invoiced EUR amount. The proposed buyer-facing receipt links the credit to the invoice. Internal routing is not visible to the buyer.':
      'მომწოდებელი ინვოისის EUR თანხას იღებს. შემსყიდველისთვის შემოთავაზებული ქვითარი ჩარიცხვას ინვოისს უკავშირებს. შიდა მარშრუტიზაცია შემსყიდველისთვის არ ჩანს.',
    'The third bank confirms the local account credit. Neither a USD transfer nor an FX quote closes this request.':
      'მესამე ბანკი ადგილობრივ ანგარიშზე ჩარიცხვას ადასტურებს. ამ მოთხოვნას ვერც USD გადარიცხვა ხურავს და ვერც სავალუტო კოტირება.',
    'The third bank posts the SGD credit to the treasury account.': 'მესამე ბანკი SGD ჩარიცხვას ხაზინის ანგარიშზე ატარებს.',
    'The title registry receives a mark that the asset is tokenized. From now on, changes pass through AST.':
      'საკუთრების რეესტრი იღებს აღნიშვნას, რომ აქტივი ტოკენიზებულია. ამიერიდან ცვლილებები AST-ის გავლით ხდება.',
    'The treasury agrees a USD/SGD quote with its executing bank and approves the conversion.': 'ხაზინა შემსრულებელ ბანკთან USD/SGD კოტირებას ათანხმებს და კონვერტაციას ამტკიცებს.',
    'The treasury instructs a supported USDC transfer to the destination network through CCIP.': 'ხაზინა მხარდაჭერილ USDC გადაცემას დანიშნულების ქსელზე CCIP-ის მეშვეობით ავალებს.',
    'The treasury matches actual credit to the authorised tranche. Subsequent spending requires separate evidence.':
      'ხაზინა ფაქტობრივ ჩარიცხვას ავტორიზებულ ტრანშს ადარებს. შემდგომ ხარჯვას ცალკე მტკიცებულება სჭირდება.',
    'The treasury reconciles its account credit against the tranche authorisation.': 'ხაზინა ანგარიშზე ჩარიცხვას ტრანშის ავტორიზაციასთან აჯერებს.',
    'The venue settles the purchase and the custodian confirms the same bond position. The issuer controls the issue.':
      'სავაჭრო პლატფორმა შესყიდვას ასწორებს, მეურვე კი იმავე ობლიგაციის პოზიციას ადასტურებს. გამოშვებას ემიტენტი აკონტროლებს.',
    'The withdrawal request reaches the withdrawal service.': 'გატანის მოთხოვნა გატანის სერვისს აღწევს.',
    'Tier 1 is approved, with a low purchase limit. The purchase is above it.': 'დონე 1 დამტკიცებულია დაბალი შესყიდვის ლიმიტით. შესყიდვა მას აღემატება.',
    'Tier 2 is approved. The purchase limit now covers': 'დონე 2 დამტკიცებულია. შესყიდვის ლიმიტი ახლა ფარავს:',
    'Tier 2 review: proof of address and source of funds are read. This can take hours or days.':
      'დონე 2-ის განხილვა: მოწმდება მისამართისა და სახსრების წყაროს დადასტურება. ამას შეიძლება საათები ან დღეები დასჭირდეს.',
    'Travel rule: the exchange needs the recipient’s name and address. If the sender does not know them, the withdrawal stops here.':
      'Travel rule: ბირჟას მიმღების სახელი და მისამართი სჭირდება. თუ გამგზავნმა ისინი არ იცის, გატანა აქ ჩერდება.',
    'Treasury needs JPY in Tokyo against available GBP in London before its margin payment deadline.':
      'ხაზინას ტოკიოში JPY სჭირდება ლონდონში ხელმისაწვდომი GBP-ის სანაცვლოდ, მარჟის გადახდის ბოლო ვადამდე.',
    'Two different currencies, no dollar on the route. Today the payment passes through correspondents. With AFC, one process settles it in seconds.':
      'ორი სხვადასხვა ვალუტა, მარშრუტზე დოლარის გარეშე. დღეს გადახდა კორესპონდენტების გავლით მიდის. AFC-ით მას ერთი პროცესი წამებში ასწორებს.',
    'Two-factor code and an e-mail confirmation for the new address. A cooling-off period may apply.':
      'ორფაქტორიანი კოდი და ელფოსტით დადასტურება ახალი მისამართისთვის. შეიძლება მოქმედებდეს მოფიქრების პერიოდი.',
    'USD pays the liquidity provider from the exchange’s inventory.': 'USD ლიკვიდობის პროვაიდერს ბირჟის მარაგიდან უხდის.',
    'Under the proposed arrangement AFC coordinates delivery of the confirmed proceeds using an authorised network route.':
      'შემოთავაზებული შეთანხმებით AFC დადასტურებული შემოსავლის მიწოდებას ავტორიზებული ქსელური მარშრუტით კოორდინაციას უწევს.',
    'Validators add the transfer to a block and check it against the ledger.': 'ვალიდატორები გადაცემას ბლოკში ამატებენ და რეესტრთან ამოწმებენ.',
    'With the extract in hand, the notary releases the escrow.': 'ამონაწერის მიღების შემდეგ ნოტარიუსი ესქროუს ათავისუფლებს.',

    // fragments glued to names and amounts by the code
    'The acknowledgement reaches': 'დადასტურება აღწევს:',
    'The app shows the': 'აპი აჩვენებს:',
    'The card rails ask': 'ბარათის რელსები ეკითხება:',
    'The exchange buys': 'ბირჟა ყიდულობს:',
    'The message reaches': 'შეტყობინება აღწევს:',
    'The owner holds a signed institutional valuation': 'მესაკუთრე ფლობს ხელმოწერილ ინსტიტუციურ შეფასებას',
    'The owner holds the same signed institutional valuation': 'მესაკუთრე ფლობს იმავე ხელმოწერილ ინსტიტუციურ შეფასებას',
    'The sender asks to withdraw': 'გამგზავნი ითხოვს გატანას:',
    'The sender wants to deliver': 'გამგზავნს სურს მიაწოდოს',
    'The sender’s balance shows': 'გამგზავნის ნაშთი აჩვენებს:',
    'The transfer reaches': 'გადაცემა აღწევს:',
    'and belong to the owner.': 'და მესაკუთრეს ეკუთვნის.',
    'approves a card payment to a crypto exchange. It cannot send crypto to the wallet.': 'ამტკიცებს ბარათით გადახდას კრიპტობირჟაზე. მას საფულეზე კრიპტოს გაგზავნა არ შეუძლია.',
    'arrives in the recipient’s wallet.': 'მიმღების საფულეში შედის.',
    'at its quoted rate.': 'მისი კოტირებული კურსით.',
    'at the applicable rate.': 'შესაბამისი კურსით.',
    'balance to the sender.': 'ნაშთს გამგზავნს.',
    'checks the beneficiary. The funds are not credited yet.': 'ბენეფიციარს ამოწმებს. სახსრები ჯერ არ ჩარიცხულა.',
    'comes back to the exchange. It is recorded in the custody ledger.': 'ბირჟას უბრუნდება. ის მეურვეობის რეესტრში აღირიცხება.',
    'completes its own KYC/AML and sanctions screening before it calls AFC. Compliance stays with the initiating institution.':
      'AFC-ის გამოძახებამდე საკუთარ KYC/AML და სანქციურ შემოწმებას ასრულებს. შესაბამისობა ინიციატორ ინსტიტუციასთან რჩება.',
    'confirms the authorisation to the card rails.': 'ბარათის რელსებს ავტორიზაციას უდასტურებს.',
    'credit is confirmed. The transaction is real.': 'ჩარიცხვა დადასტურებულია. ტრანზაქცია რეალურია.',
    'credits the beneficiary, net of its lifting fee.': 'ბენეფიციარს ურიცხავს, თავისი საკომისიოს გამოკლებით.',
    'credits the beneficiary.': 'ბენეფიციარს ურიცხავს.',
    'credits the beneficiary. AFC never held the funds.': 'ბენეფიციარს ურიცხავს. AFC სახსრებს არასოდეს ფლობდა.',
    'funds are accepted on the fiat anchor’s reserve account for AFC.': 'სახსრები AFC-სთვის ფიატ-ანკერის სარეზერვო ანგარიშზე მიიღება.',
    'holds the client’s funds. They leave circulation but have not moved.': 'კლიენტის სახსრებს ბლოკავს. ისინი ბრუნვიდან გამოდის, მაგრამ არ გადაადგილებულა.',
    'is credited to the fiat anchor’s account.': 'ფიატ-ანკერის ანგარიშზე ირიცხება.',
    'is credited to': 'ირიცხება:',
    'leg and checks its reserve.': 'ნაწილს და თავის რეზერვს ამოწმებს.',
    'on its own books.': 'საკუთარ ბალანსზე.',
    'on the card as an authorisation. No money has moved yet.': 'ბარათზე, როგორც ავტორიზაცია. ფული ჯერ არ გადაადგილებულა.',
    'puts the client’s funds on hold. They leave circulation but have not moved anywhere.': 'კლიენტის სახსრებს ბლოკავს. ისინი ბრუნვიდან გამოდის, მაგრამ არსად გადაადგილებულა.',
    'receives a payment order': 'იღებს საგადახდო დავალებას',
    'receives the order and checks the customer before it moves any money.': 'იღებს დავალებას და ფულის გადაადგილებამდე კლიენტს ამოწმებს.',
    'receives the order': 'იღებს დავალებას',
    'receives the same payment order': 'იღებს იმავე საგადახდო დავალებას',
    'releases the card hold after settlement.': 'ანგარიშსწორების შემდეგ ბარათის დაბლოკვას ხსნის.',
    'request to AFC.': 'მოთხოვნას AFC-ს.',
    'reserve covers the payout.': 'რეზერვი გაცემას ფარავს.',
    'runs two checks in parallel: KYC/AML screening (violet) and the Nostro accounting entry (blue).':
      'პარალელურად ორ შემოწმებას ასრულებს: KYC/AML (იისფერი) და Nostro-ს საბუღალტრო გატარება (ლურჯი).',
    'screens the beneficiary. The funds are still not credited.': 'ბენეფიციარს ამოწმებს. სახსრები ჯერ კიდევ არ ჩარიცხულა.',
    'sends a payment message to the correspondent.': 'კორესპონდენტს საგადახდო შეტყობინებას უგზავნის.',
    'sends an MT103 message. Correspondent 1 appears on the route.': 'MT103 შეტყობინებას აგზავნის. მარშრუტზე კორესპონდენტი 1 ჩნდება.',
    'sends an acknowledgement back down the chain. Correspondent 2 releases its hold.': 'დადასტურებას ჯაჭვით უკან აგზავნის. კორესპონდენტი 2 დაბლოკვას ხსნის.',
    'sends one request': 'ერთ მოთხოვნას აგზავნის',
    'submits the cleared order to AFC as one API call. No message chain, no holds at intermediaries.':
      'შემოწმებულ დავალებას AFC-ს ერთი API გამოძახებით წარუდგენს. შეტყობინებების ჯაჭვისა და შუამავლებთან დაბლოკვების გარეშე.',
    'takes its fee and the FX spread.': 'იღებს თავის საკომისიოს და კურსთაშორის სხვაობას.',
    'the beneficiary’s bank.': 'ბენეფიციარის ბანკი.',
    'to one wallet. A bank cannot pay a crypto wallet directly.': 'ერთ საფულეზე. ბანკს კრიპტოსაფულეზე პირდაპირ გადახდა არ შეუძლია.',
    'to the recipient’s wallet address.': 'მიმღების საფულის მისამართზე.',
    'was credited to': 'ჩაირიცხა:',
    'with its own USD inventory, at its price. The card settles later.': 'საკუთარი USD მარაგით, თავისი ფასით. ბარათი მოგვიანებით სწორდება.',

    // notes and "why" texts (contain semicolons)
    'Architecture illustration only. The requesting institution interacts only with AFC. No participant sees the full internal sequence. AFC holds no funds; the anchors hold their own reserves. The crypto anchor converts only because the request names a crypto asset. Timings are examples, not quotes.':
      'მხოლოდ არქიტექტურის ილუსტრაცია. მომთხოვნი ინსტიტუცია მხოლოდ AFC-სთან ურთიერთობს. სრულ შიდა თანმიმდევრობას არცერთი მონაწილე არ ხედავს. AFC სახსრებს არ ფლობს; ანკერები საკუთარ რეზერვებს ფლობენ. კრიპტოანკერი კონვერტაციას მხოლოდ იმიტომ ასრულებს, რომ მოთხოვნაში კრიპტოაქტივია მითითებული. ვადები მაგალითებია და არა კოტირებები.',
    'ArosCoin is issued 1 = 1 against the confirmed': 'ArosCoin გამოიცემა 1 = 1 დადასტურებულის სანაცვლოდ:',
    'Illustrative model. AFC holds no funds; each institution settles on its own books. AFC is a logical process layer.':
      'საილუსტრაციო მოდელი. AFC სახსრებს არ ფლობს; ყოველი ინსტიტუცია ანგარიშს საკუთარ ბალანსზე ასწორებს. AFC ლოგიკური პროცესის ფენაა.',
    'Illustrative model. Timings, fees and FX rates are examples, not quotes, service levels or performance claims. AFC is a logical process layer: it holds no funds, issues no money and is not a party to settlement; licensed institutions keep their roles, checks and decisions. NodeChain belongs to AST.':
      'საილუსტრაციო მოდელი. ვადები, საკომისიოები და სავალუტო კურსები მაგალითებია და არა კოტირებები, მომსახურების დონეები ან შესრულების მტკიცებები. AFC ლოგიკური პროცესის ფენაა: ის სახსრებს არ ფლობს, ფულს არ გამოსცემს და ანგარიშსწორების მხარე არ არის; ლიცენზირებული ინსტიტუციები თავიანთ როლებს, შემოწმებებსა და გადაწყვეტილებებს ინარჩუნებენ. NodeChain AST-ს ეკუთვნის.',
    'Illustrative model; notarial and registry steps vary by jurisdiction and asset class. AST does not appraise assets: it accepts an already confirmed institutional valuation and mints strictly at that price (AST Canon §5.1–5.2). AST may hold only its own funds, so the investor pays the owner directly (Canon §4.4). The title registry keeps its role and receives a "tokenized" mark (Canon §5.3). Timings are examples, not quotes, service levels or performance claims; registry marking depends on the registry.':
      'საილუსტრაციო მოდელი; სანოტარო და სარეესტრო ნაბიჯები იურისდიქციისა და აქტივის კლასის მიხედვით განსხვავდება. AST აქტივებს არ აფასებს: ის იღებს უკვე დადასტურებულ ინსტიტუციურ შეფასებას და მკაცრად ამ ფასით მინტავს (AST Canon §5.1–5.2). AST-ს მხოლოდ საკუთარი სახსრების ფლობა შეუძლია, ამიტომ ინვესტორი მესაკუთრეს პირდაპირ უხდის (Canon §4.4). საკუთრების რეესტრი თავის როლს ინარჩუნებს და „ტოკენიზებულის“ აღნიშვნას იღებს (Canon §5.3). ვადები მაგალითებია და არა კოტირებები, მომსახურების დონეები ან შესრულების მტკიცებები; რეესტრში აღნიშვნა რეესტრზეა დამოკიდებული.',
    'Its London books debit and credit GBP; its Japan books debit and credit JPY between the two banks.':
      'მისი ლონდონის ბალანსი ორ ბანკს შორის GBP-ს ჩამოწერს და ჩარიცხავს; მისი იაპონიის ბალანსი — JPY-ს.',
    'NodeChain records the transfer of rights. The investor’s token is the record; a resale is one more record.':
      'NodeChain უფლებების გადაცემას აღრიცხავს. ინვესტორის ტოკენი თავად ჩანაწერია; ხელახალი გაყიდვა კიდევ ერთი ჩანაწერია.',
    'Only now AST issues ArosCoin 1 = 1 against the confirmed': 'მხოლოდ ახლა გამოსცემს AST ArosCoin-ს 1 = 1 დადასტურებულის სანაცვლოდ:',
    'PoT verified = 1': 'PoT გადამოწმებულია = 1',
    'The LC terms become one machine-readable contract. When the carrier’s evidence arrives, both banks check it against the terms in one place. Banks keep their roles and their checks; AFC holds no funds and takes no credit risk.':
      'აკრედიტივის პირობები ერთ მანქანურად წაკითხვად ხელშეკრულებად იქცევა. როცა გადამზიდავის მტკიცებულება მოდის, ორივე ბანკი მას პირობებთან ერთ ადგილას ამოწმებს. ბანკები თავიანთ როლებსა და შემოწმებებს ინარჩუნებენ; AFC სახსრებს არ ფლობს და საკრედიტო რისკს არ იღებს.',
    'The owner transfers one token to the investor, who pays the owner directly, outside AST. NodeChain records the transfer of rights; AST holds no third-party funds.':
      'მესაკუთრე ინვესტორს ერთ ტოკენს გადასცემს, ინვესტორი კი მესაკუთრეს პირდაპირ, AST-ის გარეშე უხდის. NodeChain უფლებების გადაცემას აღრიცხავს; AST მესამე პირების სახსრებს არ ფლობს.',
    'The same institutions are connected through the AFC protocol layer. Each checks its own data once, at the same time, and the evidence is recorded. Authority and funds stay with the institutions; AFC coordinates the process and decides nothing.':
      'იგივე ინსტიტუციები AFC პროტოკოლის ფენით არიან დაკავშირებული. თითოეული საკუთარ მონაცემებს ერთხელ, ერთდროულად ამოწმებს და მტკიცებულება აღირიცხება. უფლებამოსილება და სახსრები ინსტიტუციებთან რჩება; AFC პროცესს კოორდინაციას უწევს და არაფერს წყვეტს.',
    'The sender’s bank clears its own compliance checks first. Then AFC runs one pass: every institution confirms its own account and liquidity at the same time. Money still moves on the institutions’ own books; AFC never holds it.':
      'გამგზავნის ბანკი ჯერ საკუთარ შესაბამისობის შემოწმებებს ასრულებს. შემდეგ AFC ერთ გავლას ატარებს: ყოველი ინსტიტუცია ერთდროულად ადასტურებს საკუთარ ანგარიშსა და ლიკვიდობას. ფული კვლავ ინსტიტუციების საკუთარ ბალანსზე მოძრაობს; AFC მას არასოდეს ფლობს.',
    'leg, 1 = 1.': 'ნაწილი, 1 = 1.',
  };

  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var exact = Object.create(null);
  Object.keys(KA).forEach(function (k) { exact[norm(k)] = KA[k]; });
  // fragments: only multi-word keys, longest first, so short words inside sentences are never hit
  // SVG sub-labels are written in capitals in the source ("SENDER'S BANK")
  var lower = Object.create(null);
  Object.keys(exact).forEach(function (k) { lower[k.toLowerCase()] = exact[k]; });
  var PATTERNS = [
    [/^Step (\d+) \/ (\d+)$/i, 'ნაბიჯი $1 / $2'],
    [/^illustrative$/i, 'საილუსტრაციო'],
  ];
  var frags = Object.keys(exact).filter(function (k) { return k.split(' ').length >= 3; })
    .sort(function (a, b) { return b.length - a.length; });

  function tr(s) {
    var n = norm(s);
    if (!n || !/[A-Za-z]/.test(n)) return s;
    var hit = exact[n] || lower[n.toLowerCase()];
    if (hit) {
      var r = s.replace(n, hit);
      return r === s ? hit : r;
    }
    for (var k = 0; k < PATTERNS.length; k++) {
      if (PATTERNS[k][0].test(n)) return n.replace(PATTERNS[k][0], PATTERNS[k][1]);
    }
    // "Commercial · 2 topics": translate each part around the separator
    if (n.indexOf(' · ') !== -1) {
      var parts = n.split(' · ').map(function (p) { return exact[p] || lower[p.toLowerCase()] || p; });
      var joined = parts.join(' · ');
      if (joined !== n) return joined.replace(/\b(\d+) topics?\b/, '$1 თემა');
    }
    var out = s.replace(/\b(\d+) topics?\b/, '$1 თემა').replace(/ as ([A-Z]{2,5})\b/g, ' $1-ად');
    for (var i = 0; i < frags.length; i++) {
      if (out.indexOf(frags[i]) !== -1) out = out.split(frags[i]).join(exact[frags[i]]);
    }
    return out;
  }

  var ATTRS = ['title', 'placeholder', 'aria-label'];
  function fixText(node) {
    var p = node.parentNode;
    if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return;
    var v = node.nodeValue, t = tr(v);
    if (t !== v) node.nodeValue = t;
  }
  function fixEl(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (a) { var t = tr(a); if (t !== a) el.setAttribute(ATTRS[i], t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1) return;
    fixEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) fixText(n); else fixEl(n); }
  }

  function start() {
    walk(document.body);
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixEl(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
