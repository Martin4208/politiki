import { StanceData } from './party-stance';

/* 
cra: specific policies長すぎるため分析済みだが、再分析を検討
shinfu: 情報不足のため未分析
jcp: 未分析
*/


export const stances_for_quick_questions: StanceData[] = [
    {
        "ldp": {
            "consumption-tax": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "消費税の直接引き下げは明記なし。飲食料品を2年間に限り消費税の対象としないことを「国民会議」で検討加速すると記載。暫定税率廃止（ガソリン・軽油）は明記"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "法人税に関する直接的な記述なし"
            },
            "minimum-wage": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「最低賃金の引上げ加速」「賃上げの継続を支援」と記載。具体的な数値目標（例：1500円）の明示はなし"
            },
            "nuclear-power": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「原子力規制委員会により厳しい安全性基準への適合が認められた原子力発電所については、立地自治体等関係者の理解と協力のもと再稼働を進める」と明記。次世代革新炉の開発・設置も明記"
            },
            "renewable-energy": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「再生可能エネルギーの主力電源化を徹底」「洋上風力2040年までに3,000万kW～4,500万kW」「ペロブスカイト太陽電池2040年までに20GW」など具体的数値目標を伴い複数箇所で推進を明記"
            },
            "article-9": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「現行憲法の自主的改正は立党以来の党是」と明記。自衛隊の明記を含む4項目の条文イメージを提示し、国民投票実施・早期実現を目標として掲げる"
            },
            "defense-budget": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「新しい戦い方への対応」「防衛体制を構築」「防衛産業・サプライチェーンの抜本的強化」を明記。ただし防衛費のGDP比等の具体的数値目標の記載はなし"
            },
            "immigration": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "育成就労制度・特定技能制度の適正化を推進する一方、不法滞在者ゼロや在留審査の厳格化も明記。受け入れ拡大と管理強化を併記した条件付きスタンス"
            },
            "same-sex-marriage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "同性婚に関する記述は文書中に一切なし"
            },
            "separate-surnames": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "選択的夫婦別姓に関する直接的記述はなし。「旧氏の通称使用の法制化を目指す」との記載はあるが、別姓制度導入とは異なる"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "高校無償化（令和8年度から新たな就学支援金制度）、幼児教育・保育の無償化推進、大学等高等教育費の負担軽減拡充、令和8年度から公立小学校等の給食無償化を具体的に明記"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「加速化プラン」3.6兆円規模の子育て支援強化、児童手当の抜本的拡充、こども誰でも通園制度の本格実施など、具体的施策を看板政策として多数明記"
            },
            "labor-flexibility": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「生産性の高い分野への円滑な労働移動」「労働市場改革を推進」と記載。ただし解雇規制の緩和を明示的に推進するとは書かれておらず、同一労働同一賃金の徹底も明記"
            },
            "ai-promotion": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「世界一AIフレンドリーな国」を目標に明記。当面1兆円超のAI関連投資、国内基盤モデル開発、AIセーフティ・インスティテュートの強化も並記しつつ、推進を看板政策として位置づけ"
            },
            "emergency-clause": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "憲法改正の4項目の一つとして「緊急事態対応」を明示。憲法審査会での条文起草・国民投票実施を目指すと明記"
            },
            "hate-speech-regulation": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "ヘイトスピーチ・差別的言動への罰則を伴う法的規制強化に関する直接的記述なし。人権擁護活動の強化・法教育推進の記載はあるが、罰則規制の推進とは言えない"
            },
            "fiscal-stimulus": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「責任ある積極財政」のもと戦略的財政出動を明記。「成長率の範囲内に債務残高の伸び率を抑える」との財政規律も同時に明記しており、無条件な国債増発ではなく条件付き積極財政のスタンス"
            }
        },
        "cra": {
            "consumption-tax": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "消費税の引き下げは明記なし。「給付付き税額控除」による逆進性対策を明記しており、引き下げではなく還付方式を採用。インボイス廃止は言及あり"
            },
            "corporate-tax": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「効果のない租税特別措置の廃止」「受取配当等益金不算入制度の見直し」により応分負担を求める方向性は示すが、税率引き上げの明示はなし。中小企業には軽減措置の本則化・減税も明記しており、一律引き上げとは言えない"
            },
            "minimum-wage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「最低賃金を全国で早期に時給1500円以上に引き上げる」と具体的数値目標を伴い明記。看板政策として掲げている"
            },
            "nuclear-power": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「地元合意がないままの原子力発電所の再稼働は認めません」「すべての原子力発電所の速やかな停止と廃炉決定をめざします」と明記。原発ゼロ社会の実現を看板政策として掲げている"
            },
            "renewable-energy": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「2030年における再生可能エネルギーによる発電割合50%程度」という数値目標を明記。「地域ごとの特性を生かした再生可能エネルギーを基本とする分散型エネルギー社会を構築」と明記"
            },
            "article-9": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「立憲主義と平和主義に基づき、安保法制の違憲部分を廃止」「論理的整合性や法的安定性に欠ける恣意的・便宜的な憲法解釈の変更は認めません」と記載。9条改正への肯定的言及はなく、平和主義の堅持を明記"
            },
            "defense-budget": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「専守防衛に徹しつつ、時代の変化に対応した質の高い防衛力の整備」と記載。防衛費の増減に関する具体的数値目標はなく、質の向上を重視する中立的記述"
            },
            "immigration": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "日本の地域・産業を支える外国人労働者の受入れを進めるため、現行の特定技能および育成就労の在留資格を見直し、外国籍の人々を尊重する新たな雇用制度の確立を目指す」と明記。拡大方向だが具体的数値目標はなし"
            },
            "same-sex-marriage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「同性婚を可能とする法制度の実現をめざします」と明記"
            },
            "separate-surnames": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「選択的夫婦別姓制度の導入」を明記。具体的施策として推進を明確に掲げている"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「保育・幼児教育を確保して、これを無償化します」「小中学校の学校給食費無償化」「所得制限のない高校授業料の無償化」「大学授業料減免の拡充」「大学・給食の無償化など、教育の無償化を強力に推進します」など、複数段階にわたる教育無償化を具体的に明記"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "育児休業給付の実質100%支給、児童手当の増額・対象拡大、ひとり親家庭支援強化、不妊治療支援拡充など、子育て支援の大幅拡充を多数具体的に明記"
            },
            "labor-flexibility": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「無期の直接雇用を原則とし、望めば正社員として働ける社会をめざします」「労働者派遣制度を見直し、対象を真に専門性のある職種に限定」と明記。解雇規制緩和とは逆方向の政策を看板政策として掲げている"
            },
            "ai-promotion": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「AI の開発・利用を推進するとともに、急激に進化するAIにより人権や民主主義が損なわれないよう…『人間中心主義』の理念のもとに行われるために必要な法制の見直し等について検討」と推進と規制を並列で記載。推進一辺倒ではない"
            },
            "emergency-clause": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「緊急事態条項を憲法に定める必要はありません」と明記。また憲法の平和主義・立憲主義の堅持を一貫して強調しており、9条改正に肯定的な記述は一切なし"
            },
            "hate-speech-regulation": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「人種・民族・出身などを理由とする差別的言動を禁止する法律の制定」「ヘイトスピーチ解消法における取り組みを拡大し、国際人権基準に基づいて…あらゆる差別撤廃に向けた動きを加速」と罰則付き法制化を具体的に明記"
            },
            "fiscal-stimulus": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "国債増発による積極財政出動に関する明示的な記述なし。「中長期的に財政の健全化をめざします」との記載があり、むしろ財政健全化志向が読み取れるが、積極財政を明確に否定する記述もない"
            }
        },
        "dpfp": {
            "consumption-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「消費税減税（10％→一律5％）を行います」と具体的数値目標を伴い明記。賃金上昇率が物価上昇率+2%に達するまでの条件付きだが、看板政策として掲げている"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "法人税率の引き上げに関する明示的な記述なし。賃上げ減税の拡充など法人税の優遇拡大方向の記述はあるが、引き上げを支持・反対する記述はない"
            },
            "minimum-wage": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「全国どこでも時給1150円以上を早期に実現」と数値目標を明記。ただし立憲民主党の1500円に比べ水準は低く、「大幅」とは言い切れない"
            },
            "nuclear-power": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「安全基準を満たした原子力発電所の早期再稼働」「地元同意を得た原子力発電所は早期に稼働させる」と明記。次世代革新炉の新増設・リプレースも含め看板政策として推進を明記"
            },
            "renewable-energy": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「2030年代には電源構成比で再エネ比率が40%以上」と数値目標を明記。ただし原子力との並立政策であり、再エネ賦課金制度の見直しも掲げており、単独の看板政策ではない"
            },
            "article-9": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「自衛権の行使の範囲」「自衛隊の保持・統制に関するルール」「9条2項との関係」の3論点から議論を進めると記載。明確な改正推進でも反対でもなく、具体的な議論継続を表明する中立的姿勢"
            },
            "defense-budget": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「専守防衛に徹しつつ防衛力を強化するため、必要な防衛費を増額します」と明記。ただし具体的な数値目標（GDP比等）の記述はなし"
            },
            "immigration": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「育成就労制度については安価な労働力の確保策として悪用されないよう厳格かつ適切な運用を求める」と記載。拡大でも縮小でもなく、適正管理を求める条件付き姿勢"
            },
            "same-sex-marriage": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「同性婚の保障についても検討を進めます」と記載。明確な推進ではなく検討段階の記述にとどまる"
            },
            "separate-surnames": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「選択的夫婦別姓制度を導入します」と明記"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「幼稚園・保育園から高校までの教育完全無償化」「大学・給食の無償化」「18歳までの医療費無料」など極めて広範な無償化を具体的・詳細に明記。看板政策"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "児童手当の18歳まで月額1万5000円への拡充、出産費用無償化、保育料無料、産後ケア無料、育児休業中の賃金保障実質100%など、子育て支援の大幅拡充を多数具体的に明記。看板政策"
            },
            "labor-flexibility": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「セーフティネットを確実に整備するとともに、労働契約の更改や終了に関するルールを明確化することで人材流動性を高めます」「求職者ベーシック・インカム制度」の導入等を明記。ただし解雇規制緩和を直接明示した記述はなく、流動化支援の方向性"
            },
            "ai-promotion": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「ディープフェイク規制法の早期整備をめざす」と一部規制にも言及しつつ、AI・IoT・量子等への投資拡大、第4次産業革命推進を積極的に明記。推進優先の姿勢が基本だが規制への言及もあり"
            },
            "emergency-clause": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「緊急時における行政府の権限を統制するための緊急事態条項を創設」「議員任期の特例延長を認める規定を創設」と明記。ただし「立法府の機能を維持」「絶対に制限してはならない人権保障を明記」と濫用防止を重視した条件付き"
            },
            "hate-speech-regulation": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "ヘイトスピーチへの罰則付き法的規制強化に関する明示的な記述なし。差別解消への言及はあるが具体的な規制強化・罰則に関する記述がない"
            },
            "fiscal-stimulus": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「財政健全化目標を見直し、積極財政等と金融緩和による『高圧経済』」「未来志向の積極財政に転換」「教育国債を毎年5兆円発行」と積極財政を看板政策として明記。財源多様化も具体的に示している"
            }
        },
        "hoshu": {
            "consumption-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「食料品（酒類含む）の消費税率を恒久的にゼロ％にする」と明記。看板政策として掲げている"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "法人税に関する明示的な記述なし"
            },
            "minimum-wage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "最低賃金に関する明示的な記述なし"
            },
            "nuclear-power": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「過度な再エネ依存の見直し」「優れた火力発電技術の有効活用」と記載。原発再稼働を明示的に支持する記述はないが、脱原発・再エネ一辺倒への反対姿勢は明確"
            },
            "renewable-energy": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「再エネ賦課金の廃止」「過度な再エネ依存の見直し」と明記。再エネ拡大とは逆方向の政策を掲げている"
            },
            "article-9": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「憲法９条改正（２項削除、自衛のための実力組織保持明記）」と具体的改正内容とともに明記。看板政策として掲げている"
            },
            "defense-budget": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「防衛研究への助成促進、防衛産業への政府投資の促進」と記載。具体的な数値目標はないが、防衛力強化の方向性を明記"
            },
            "immigration": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「特定技能2号の家族帯同を大幅に制限」「入管難民法の改正と運用の厳正化」「経営・管理ビザの相手国制限」など、外国人受け入れ縮小・厳格化を看板政策として複数明記"
            },
            "same-sex-marriage": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "直接的な反対記述はないが、「LGBT理解増進法の改正（特に児童への教育に関する条文削除）」を明記しており、同性婚推進とは逆方向の姿勢が読み取れる"
            },
            "separate-surnames": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "選択的夫婦別姓制度への言及なし。ただし「日本の国体、伝統文化を守る」を掲げており、推進の根拠となる記述も一切ない"
            },
            "education-free": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「専門学科（商業科、工業科・高専、農業科など）の無償化」は明記。一方で「大学余り」解消のため補助金削減・統廃合促進も明記しており、無償化拡大一辺倒ではない"
            },
            "child-support": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「出産育児一時金の引き上げ」を明記する一方、「国籍条項をつける」との条件付き。「男女共同参画事業に関する支出の抜本的見直し」も掲げており、子育て支援予算の大幅増とは言い切れない"
            },
            "labor-flexibility": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "解雇規制緩和・労働市場流動化に関する明示的な記述なし"
            },
            "ai-promotion": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "生成AI等の新技術開発の規制・推進に関する明示的な記述なし"
            },
            "emergency-clause": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "緊急事態条項の新設に関する明示的な記述なし"
            },
            "hate-speech-regulation": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「LGBT理解増進法の改正」を掲げており、差別的言動への法的規制強化とは逆方向の姿勢。ただし差別規制一般への反対を明示した記述はない"
            },
            "fiscal-stimulus": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「省庁、事業、海外拠出金などを大胆に整理し減税財源に」と歳出削減による減税を明記。積極財政・国債増発とは明確に逆方向の政策を看板政策として掲げている"
            }
        },
        "ishin": {
            "consumption-tax": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "中長期的に消費税を8%に引き下げ（軽減税率廃止）を明記。また食品の消費税を2年間ゼロとする時限措置も掲げており、引き下げ方向は明確だが「中長期的」との留保あり。"
            },
            "corporate-tax": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「フロー大減税」として法人税を含む減税を断行すると明記しており、引き上げではなく引き下げ方向の政策を掲げている。"
            },
            "minimum-wage": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「物価上昇や地域格差の拡大により生活費との乖離が拡大している最低賃金の水準を実勢に合わせて引き上げる」と記載。ただし具体的な数値目標（例：1500円等）は明示されていない。"
            },
            "nuclear-power": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「新規制基準の許可を得ている原子力発電所の早期再稼働を進める」「安全性が確認できた原子力発電所については可能な限り速やかに再稼働」と複数箇所で明確に推進を明記。"
            },
            "renewable-energy": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「再生可能エネルギーの導入拡大や送電網整備、洋上風力や地熱発電の推進」を明記。ただし原発再稼働と並列で記載されており、再エネ単独の看板政策ではない"
            },
            "article-9": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "憲法9条について「自衛隊を保持することを明記し、第2項については削除を含む見直しを行う」と具体的な改正方針を看板政策として明記。"
            },
            "defense-budget": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「防衛費は国民の負担増に頼らずGDP比２％まで増額」と具体的数値目標を伴い明記"
            },
            "immigration": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "専門的・技術的分野の外国人は「積極的な受け入れ」を図る一方、それ以外の就労目的外国人は「現行より高い水準」の要件を課すと明記。拡大と制限を分野によって使い分けており、全体的な拡大とは言えない。"
            },
            "same-sex-marriage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「同性婚を認め、LGBTQなどの性的少数者が不当な差別をされないための施策を推進する」と明確に記載。法制化までの間のパートナーシップ制度導入促進も明記。"
            },
            "separate-surnames": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「戸籍制度および同一戸籍・同一氏の原則を維持しながら、社会生活のあらゆる場面で旧姓使用に法的効力を与える制度の創設」と明記。選択的夫婦別姓ではなく旧姓使用の法的整備という中間案を提示"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「義務教育に加えて幼児教育・高校を所得制限なく無償化」「大学・大学院は改革と合わせて、教育の全課程の無償化を目指す」「小中学校給食を無償化」と幅広い段階での無償化を具体的に明記。看板政策"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「0〜2歳の幼児教育・保育の家計支援を拡充し未就学児の完全無償化」「出産費用の無償化」「子育てバウチャーの導入・大幅拡充」など具体的な施策を多数明記。GDPの一定割合を子どものために配分する制度も検討。"
            },
            "labor-flexibility": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「労働契約の更改や終了に関するルールを明確化することで人材流動性を高める」「フレキシキュリティが高い労働環境を創る」「職務型雇用への転換を促進」など、流動化推進の方向性を明記。ただし「解雇規制の緩和」との直接的な表現はない。"
            },
            "ai-promotion": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「アジャイル・ガバナンスをベースにした制度設計」「事業者の自主的取り組みを促す」「イノベーションを加速するために最大限活用」と推進姿勢を示す。一方でリスク対応の規律も併記しており、完全な規制より推進の優先とは若干留保あり。"
            },
            "emergency-clause": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「他国による武力攻撃、内乱・テロ、大規模自然災害、感染症の蔓延などの緊急事態に対応するための緊急事態条項を憲法に創設する」と憲法改正原案の一つとして明記。"
            },
            "hate-speech-regulation": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「表現の自由に十分留意しつつ」ヘイトスピーチを許さず「実効的な拡散防止措置を講じる」と記載。ただし「罰則を伴う法的規制」については明示されておらず、「表現の自由に十分留意」との留保が付いている。"
            },
            "fiscal-stimulus": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「赤字幅が拡大した基礎的財政収支（プライマリーバランス）について現実的な黒字化の目標期限を再設定」「増税のみに頼らない成長重視の財政再建」を掲げており、積極的な国債増発よりも財政再建・歳出削減を重視する方向性。ただし防衛費財源として「臨時国債の発行」を短期的に検討するとも記載。"
            }
        },
        "jcp": {
            "consumption-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「消費税の廃止をめざし、緊急に5%に減税」と具体的数値を伴い明記。インボイス廃止、食料品ゼロ税率なども提案。看板政策。"
            },
            "corporate-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「安倍政権以前の28%に戻す（中小企業を除く）」と具体的数値で明示。大企業内部留保課税も提案。法人税引き上げを積極推進。"
            },
            "minimum-wage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「最低賃金を時給1,500円、1,700円に引き上げる」と具体的数値目標を明記。全国一律最賃制の確立も主張。中小企業支援とセットで今すぐ実現するとしている。"
            },
            "nuclear-power": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「原発ゼロの日本を」「再稼働をやめ、原発・核燃サイクルからの撤退」を明確に主張。自民・維新の再稼働推進を「言語道断」と批判。看板政策として原発廃止を掲げる。"
            },
            "renewable-energy": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「再生可能エネルギーの大幅導入への抜本的転換の計画を立てて実行」「自然エネルギー大国に切り替える」と明記。原発ゼロと一体の看板政策。"
            },
            "article-9": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「憲法9条の完全実施（自衛隊の解消）に向かって段階的に解決」と明記。9条改正に反対するだけでなく将来的な自衛隊解消まで掲げており、9条堅持が最重要の看板政策。"
            },
            "defense-budget": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "提供文書に防衛費への直接言及はないが、核兵器廃絶・平和主義の立場から防衛費増額には反対の姿勢が強く示唆される。ただし直接的記述なし"
            },
            "immigration": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "特定技能制度による外国人労働者受け入れ拡大を「断じて認められない」と明記。技能実習・育成就労制度も「廃止を含めた根本からの見直し」を求める。受け入れ拡大ではなく権利保護・条件改善を主張。"
            },
            "same-sex-marriage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「同性婚を認める民法改正を行います」「LGBT平等法を制定」と明確に明記。看板政策の一つ。"
            },
            "separate-surnames": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「民法を改正し、ただちに選択的夫婦別姓制度を導入します」と独立した政策文書で看板政策として明記。通称使用の法制化は「すでに決着のついた問題」と明確に否定。"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「高等教育無償化を含めた高等教育振興計画を策定する」と明記。幼児〜大学の全課程無償化をめざすとしており、教育費無償化は看板政策。"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "子育て支援の大幅拡充を強く主張。財源は医療保険料上乗せでなく大企業・富裕層課税と大軍拡中止で確保すべきとする。子育て支援予算増自体は看板政策。"
            },
            "labor-flexibility": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「解雇の金銭解決」制度に「断固反対」「解雇自由化を許さず」と明記。「解雇規制法をつくる」という逆方向の看板政策を提示。労働移動の円滑化路線にも明確に反対。"
            },
            "ai-promotion": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「推進一辺倒の姿勢を改め、日本版AI規制法を制定する」と明記。EUのリスクベース規制モデルを参照し、リスクに応じた厳格な管理・偽誤情報排除の仕組みを求める。AI軍事利用にも反対。推進より規制を優先する姿勢が明確。"
            },
            "emergency-clause": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "hate-speech-regulation": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "川崎市の刑事罰付き条例を肯定的に評価・紹介。「人種・民族的属性を理由にした差別的取扱いを禁止する立法を検討すべき」と国レベルの法整備を明記。2016年審議では禁止規定の明文化を修正要求として提出。罰則を含む規制強化を積極支持。"
            },
            "fiscal-stimulus": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「赤字国債＝借金に頼ることはできません」と節見出しで明示。金利急騰・インフレリスクを詳述し財源は税制改革で確保する立場。緊急・時限的措置への国債活用は認めるが、積極的国債増発路線には明確に反対。"
            }
        },
        "nhk": {
            "consumption-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「消費税率5%を目標とし、最低限8%まで段階的に引き下げることを求める」と明記。軽減税率廃止・インボイス廃止とセットで看板政策として掲げる"
            },
            "corporate-tax": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「租税特別措置を原則廃止し、法人税率のシンプルな引き下げを求める」「第一次産業に対して法人税の大規模減税を実施」と引き下げを明記"
            },
            "minimum-wage": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「最低賃金の引き上げなどの労働市場への過度な介入に反対します」と明示的に反対を表明"
            },
            "nuclear-power": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「避難計画・原子力損害負担・最終処分場などの課題を早急に解決し、内閣総理大臣の決断で原発再稼働を断行することを求める」と明記"
            },
            "renewable-energy": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "FIT（再エネ固定価格買取制度）を「国民の生活コスト引き上げ」と批判しGX賦課金（炭素税）撤回を求める。再エネを「環境利権」と位置づけ否定的"
            },
            "article-9": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「自衛隊の位置づけを軍隊として明確化」「将来的には憲法改正を行う」「自由主義憲法草案を公表」と明記。9条改正を看板政策として掲げる"
            },
            "defense-budget": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "核武装推進・防衛外交強化・サイバー人材の給与体系改革など防衛力強化を多数明記。ただし防衛費の数値目標（GDP比等）の明示はなし"
            },
            "immigration": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "特定技能実習制度を「制度破綻」と断じ早急な見直しを求める。特別永住者資格廃止、仮放免基準強化、不法滞在即時送還など管理強化が基調"
            },
            "same-sex-marriage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "同性婚に関する直接的な記述なし。LGBT理解増進法廃止は明記されているが、同性婚への賛否は言及なし"
            },
            "separate-surnames": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "選択的夫婦別姓に関する直接的な記述なし"
            },
            "education-free": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "所得制限撤廃・シンプルな制度化は求めるが、教育無償化の拡大を積極推進する記述はなし。むしろ文科省解体・教育補助金見直しの方向性が強い"
            },
            "child-support": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「こども家庭庁」について効果が確認できない場合は廃止を求め、出生率改善への統計的有意性がない施策の廃止・見直しを主張。子育て支援予算の大幅増には否定的"
            },
            "labor-flexibility": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「労働法制を見直し、解雇紛争の金銭解決などを可能とすることで、労働者を新たに雇用しやすく、再チャレンジができる働く環境を作る」と明記"
            },
            "ai-promotion": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「AI、ドローン、3Dプリンターなどの最新技術を取り入れた戦力構築」「自動運転推進のため不要規制廃止」など技術推進は明記。ただしAI規制への体系的言及は薄い"
            },
            "emergency-clause": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "緊急事態条項の新設に関する直接的な記述なし。憲法改正は主張するが緊急事態条項への賛否は文書中に存在しない"
            },
            "hate-speech-regulation": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「言論統制に繋がるSNS規制に断固として反対」「表現の自由を最大限尊重」を繰り返し明記。罰則を伴うヘイトスピーチ規制強化とは逆方向のスタンス"
            },
            "fiscal-stimulus": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「全ての増税に反対し、減税のための財源は国債発行に頼らず税収増加と予算要求上限額の設定厳格化で捻出する」と明記。国債増発による財政出動に否定的"
            }
        },
        "reiwa": {
            "consumption-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「消費税は廃止する。最低でも５％への減税を実現する」と看板政策として明記。消費税を「景気回復を妨げる消費への罰金」と位置づけ廃止を強く訴える"
            },
            "corporate-tax": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「法人税を引き上げ、累進課税を導入する」「大企業優遇となっている複雑な税制や租税特別措置を整理する」と明記。大企業への自社株買い課税やタックスヘイブン規制も明記"
            },
            "minimum-wage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「最低賃金を全国一律1500円に引き上げる」と数値目標を明示。中小企業への社会保険料減免等の徹底支援もセットで明記し看板政策として掲げる"
            },
            "nuclear-power": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「原発は即時禁止し、政府が買い上げて廃炉をすすめる」と明記。原発の全廃・即時禁止を看板政策として掲げており、再稼働に明確に反対"
            },
            "renewable-energy": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「グリーン産業に10年間で官民合わせて200兆円（毎年国費5兆円、民間資金15兆円）の投資」「2030年までにエネルギー供給の70%を再生可能エネルギーで」など具体的数値目標を伴い看板政策として明記"
            },
            "article-9": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「憲法9条が国際紛争に関与しないために寄与してきた役割は極めて重要であり、現行の条文は維持する」と明記。自衛隊明記を含む改憲4項目は「現行法の運用で実施可能であり改憲は必要ない」と明確に反対"
            },
            "defense-budget": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「5年間で43兆円の軍事費倍増計画を中止」「防衛財源確保法は廃止」と明記。防衛費削減を看板政策として掲げており、増額に明確に反対"
            },
            "immigration": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「技能実習制度は廃止する」「外国人の権利を守る法制度へ改定」と外国人の権利保護を明記。一方で単純な受け入れ拡大ではなく権利・待遇の改善と管理の適正化を条件として強調"
            },
            "same-sex-marriage": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「同性婚を法制化する」と明記。「国際的な人権基準に基づいたLGBTQ+差別解消を目的にする法律を速やかに法制化する」も併せて看板政策として掲げる"
            },
            "separate-surnames": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「選択的夫婦別姓を実現する」と明記。ジェンダー平等政策の一つとして看板政策に位置づけている"
            },
            "education-free": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「幼児から大学院生まで、保育・教育は完全無償化する」と明記。「奨学金徳政令」で約580万人の借金帳消しも明記し看板政策として掲げる"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「年間7200億円の財政投資で保育従事者の給与を月10万円引き上げ」「すべての子どもに所得制限なしで毎月3万円を給付」「OECD最低水準の子育て・教育予算を倍にする」と具体的数値目標を伴い明記"
            },
            "labor-flexibility": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「派遣法を根本から見直す。派遣労働を含む有期労働契約を原則禁止する」「高度プロフェッショナル制度を廃止し、裁量労働制の規制を強化する」と明記。解雇規制緩和・労働市場流動化に明確に反対"
            },
            "ai-promotion": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「個人情報を保護するための法制度を強化する」「デジタル技術による監視社会化を防ぐ」「医療分野のビッグデータ活用は安易な推進は行わない」と規制重視の姿勢が基調。AI・デジタル推進も一部明記するが推進優先とは言えない"
            },
            "emergency-clause": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「有事に政府への権限集中を認める緊急事態条項の新設は行わない」と明記。自民党改憲4項目の「緊急事態条項」についても「現行法の運用で実施可能であり改憲は必要ない」と明確に反対"
            },
            "hate-speech-regulation": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「ヘイトスピーチ解消法だけでなく、さらに外国人差別をなくすための法制度を整備する」「国際的な人権基準に基づいたLGBTQ+差別解消を目的にする法律を速やかに法制化する」と罰則を含む法的規制強化を明記"
            },
            "fiscal-stimulus": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「需要が不足し失業が生じている局面では、支出拡大や減税によって総需要を刺激する」「プライマリーバランス黒字化目標を破棄する」「新規国債の発行も財源のひとつ」と積極財政を看板政策として明記。財務省設置法の改正まで求める"
            }
        },
        "sansei": {
            "consumption-tax": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「消費税の段階的廃止を進め、国民負担を直接軽減。国民負担率を35%以内に収める」と明記。即時廃止ではなく段階的廃止の表現だが廃止を目標とした明確な減税志向"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "法人税に関する直接的な引き上げ・引き下げの記述なし。「株主偏重の分配を見直し従業員分配と設備投資への税制優遇を強化する」との記述はあるが、法人税率変更の明示はない"
            },
            "minimum-wage": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「政府が賃上げ要請をしなくとも経済成長に伴う賃金上げが実現する経済環境を作る」という間接的アプローチが基調。最低賃金の全国一律大幅引き上げには否定的で、業種・職種別最低賃金の整備を提案"
            },
            "nuclear-power": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「避難計画、原子力損害負担、最終処分場などの課題を早急に解決し、内閣総理大臣の決断で原発再稼働を断行することを求める」と明記。次世代型小型原発・核融合の研究開発推進も明記"
            },
            "renewable-energy": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「パリ協定の離脱により炭素目標を撤回し、高コストな再エネ推進は即刻中止する」「FIT制度・再エネ賦課金を廃止する」と明記。再エネを「資本流出・環境破壊」と位置づけ縮小を看板政策として掲げる"
            },
            "article-9": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「日本人自らが憲法を一から創る『創憲』に向けた国民運動を推進する」と明記。自衛隊の軍隊としての位置づけ明確化、非核三原則見直し、安保3文書改定など改憲・防衛強化を看板政策として掲げる"
            },
            "defense-budget": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「防衛は①日本の防衛力②日米同盟③国際連携の三本柱で進める」「核シェアリングも含めた議論を行い、核保有国に核を使わせない対等な抑止力を持つ」と明記。防衛費増額は数値目標の明示はないが防衛力強化を看板政策として掲げる"
            },
            "immigration": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「実質的な移民政策となっている特定技能制度や育成就労制度を抜本的に見直し、外国人の受入れ数に制限をかける」「市区町村単位で日本国民の5%までの人数制限」と明記。外国人受け入れ抑制を看板政策として掲げる"
            },
            "same-sex-marriage": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「LGBT理解増進法を廃止。同性婚に反対」と明記。「過度な少数者保護による社会の分裂と混乱を防ぐ」として同性婚反対を看板政策として掲げる"
            },
            "separate-surnames": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「日本の伝統的な家族観と子供が安心して育つ環境を守るため、選択的夫婦別姓制度導入に反対」と明記。「国民の69.2%が夫婦同姓維持を支持」と根拠を示して反対を看板政策として掲げる"
            },
            "education-free": {
                stance: 3,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「さらなる無償化を急ぐのではなく、大学進学に偏り易い学校体系や社会の価値観・制度を見直すことこそ重要」と記載。教育投資・奨学金拡充は明記するが無償化の全面拡大には慎重。教育国債発行による支援は明記"
            },
            "child-support": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「０～15歳へ月10万円の子育て教育給付金」「第一子より段階的に減税し第三子より非課税世帯化」「育児休業の3年間への延長」など具体的数値目標を伴う大規模な子育て支援を看板政策として掲げる"
            },
            "labor-flexibility": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「派遣業務範囲の見直しなど労働者派遣法改正による非正規雇用の正規雇用化」「正社員雇用より派遣社員活用の方が企業会計上有利にならないよう税制改正」と明記。解雇規制緩和の明示的記述はなく、労働移動促進よりも安定雇用重視の姿勢"
            },
            "ai-promotion": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「AI専門家の派遣等、AI教育の積極的な導入」「生成AI・ロボティクス・高速通信網等への投資に対する税制優遇」「AIや製造業等の革新技術適応のための研究開発支援」と明記。ただし「デジタル技術による監視社会化を防ぐ」との留保も付"
            },
            "emergency-clause": {
                stance: 2,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「『感染症のまん延』が含まれる緊急事態条項には反対」と明記。憲法改正自体には積極的だが、感染症を含む緊急事態条項には明確に反対。戦争・災害への緊急対応は既存法で対応可能との立場"
            },
            "hate-speech-regulation": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「健全な民主主義の前提として偏向報道の抑止が必要。放送法第四条を厳格に運用する」と明記。ヘイトスピーチ罰則規制強化への明示的言及はなく、LGBT関連の「過激な表現規制」を学校教材から排除すると明記しており規制強化とは逆方向のスタンス"
            },
            "fiscal-stimulus": {
                stance: 4,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「財政収支の黒字化目標を見直し、積極財政による経済成長で国民の生活を豊かに」「財政法4条の改正と国債発行による積極財政を行う」「プライマリーバランス黒字化目標の撤回」と明記。ただし「国民負担率35%以内」という財政規律も同時に設定"
            }
        },
        "sdp": {
            "consumption-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "消費税に関する記述なし"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "法人税に関する記述なし"
            },
            "minimum-wage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "最低賃金に関する具体的記述なし。「非正規社会からの脱却」という方向性は示されているが数値目標等の根拠なし"
            },
            "nuclear-power": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「原発稼働はただちにゼロ、脱原発社会に向けて着実に推進」「岸田政権の新・原発推進政策を許さない」と見出しに明記"
            },
            "renewable-energy": {
                stance: 5,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「省エネを徹底し、再生可能エネルギーを促進」「緑の分権改革と地球温暖化対策の推進」と見出しに明記"
            },
            "article-9": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「平和憲法の理念の実現」「防衛費大幅増・大軍拡に断固反対」と明記。憲法9条改正に明確に反対する方向性"
            },
            "defense-budget": {
                stance: 1,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "「市民の不安に乗じた防衛費大幅増・大軍拡に断固反対！」と見出しに明記"
            },
            "immigration": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "外国人受け入れに関する具体的記述なし。「定住外国人に地方参政権を」という別の文脈の記述はあるが、労働者受け入れ拡大への賛否は判断不能"
            },
            "same-sex-marriage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "同性婚に関する直接的記述なし。「パートナーシップ制度を推進」とあるが同性婚法制化への賛否は明示されていない"
            },
            "separate-surnames": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "選択的夫婦別姓に関する直接的記述なし"
            },
            "education-free": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "教育無償化に関する直接的記述なし。「教育予算GDP5%水準の実現」という方向性は示されているが無償化の明示なし"
            },
            "child-support": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "子育て支援予算増に関する具体的記述なし。学童保育拡充・保育の質向上など方向性は示されているが規模・数値の根拠なし"
            },
            "labor-flexibility": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "解雇規制に関する記述なし。「雇用を守る！」「非正規社会からの脱却」という方向性はあるが解雇規制緩和への賛否は判断不能"
            },
            "ai-promotion": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "生成AI・AI政策に関する記述なし"
            },
            "emergency-clause": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "緊急事態条項に関する直接的記述なし。「平和憲法の理念の実現」から反対方向が推測されるが根拠文言なし"
            },
            "hate-speech-regulation": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "ヘイトスピーチ規制に関する直接的記述なし。「共生・人権の花開くまちを」という方向性はあるが罰則規制強化への賛否は判断不能"
            },
            "fiscal-stimulus": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "財政政策に関する具体的記述なし。「無駄な公共事業の見直し、次世代投資への転換」という記述はあるが積極財政出動への賛否は判断不能"
            }
        },
        "shinfu": {
            "consumption-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "corporate-tax": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "minimum-wage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "nuclear-power": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "renewable-energy": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "article-9": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "defense-budget": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "immigration": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "same-sex-marriage": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "separate-surnames": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "education-free": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "child-support": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "labor-flexibility": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "ai-promotion": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "emergency-clause": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "hate-speech-regulation": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            },
            "fiscal-stimulus": {
                stance: null,
                source: null,
                sourceURL: "",
                sourcePage: "",
                note: "blah blah"
            }
        },
    }
]