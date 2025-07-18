import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../models/ArticleModel";
import axios from "axios";
import { useAuth } from "../../context/useAuthContext";
import { usePagination } from "../../hooks/usePagination";
export const SyntaxList = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [syntaxes, setSyntaxes] = useState<ArticleModel[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<number[]>([]);
  const { displayPage, setDisplayPage, pageIndex, totalPages, setTotalPages } =
    usePagination();
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const { idToken } = useAuth();
  // //既読未読記事の取得
  // useEffect(() => {
  //   axios
  //     .get("/api/syntaxes/read/all", {
  //       headers: { Authorization: `Bearer ${idToken}` },
  //     })
  //     .then((res) => setReadArticleIds(res.data ?? []))
  //     .catch(() => setReadArticleIds([]));
  // }, [idToken]);

  // //公開中文法記事の取得
  useEffect(() => {
    const fetchsyntaxes = async () => {
      try {
        const res = await axios.get(`/api/syntaxes?page=${pageIndex}&size=10`);
        const publishedSyntaxes: ArticleModel[] = res.data.content;
        console.log(res.data);
        setSyntaxes(publishedSyntaxes);
      } catch (e) {
        console.error("文法記事取得失敗", e);
      }
    };
    fetchsyntaxes();
  }, [pageIndex]);

  const filteredSyntaxes = syntaxes.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesSearch =
      search === "" ||
      item.title.includes(search) ||
      (item.content && item.content.includes(search));
    return matchesCategory && matchesSearch;
  });

  const syntaxesByCategory = categories.map((cat) => ({
    category: cat,
    syntaxes: filteredSyntaxes.filter((a) => a.category === cat),
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold mb-6">基本文法</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="検索ワードを入力"
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:border-blue-500 w-full sm:w-1/2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:border-blue-500 text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            {syntaxesByCategory.map(({ category, syntaxes }) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <ul className="space-y-2">
                  {syntaxes.length === 0 && (
                    <li className="text-gray-400">
                      このカテゴリの記事はありません
                    </li>
                  )}
                  {syntaxes.map((item, i) => {
                    const isRead = readArticleIds.includes(item.id);
                    console.log(item);
                    return (
                      <li key={item.id}>
                        <Link
                          to={`/syntaxes/${item.id}-${item.slug}`}
                          className="block p-4 rounded bg-gray-800 hover:bg-gray-700 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold mb-4">
                                {item.title}
                                {isRead ? (
                                  <span className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">
                                    既読
                                  </span>
                                ) : (
                                  <span className="ml-2 px-2 py-1 bg-gray-500 text-white rounded text-xs">
                                    未読
                                  </span>
                                )}
                              </span>
                              <p className="text-sm text-gray-300">
                                {item.content.slice(0, 300)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
